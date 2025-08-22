from celery import shared_task
import logging
import numpy as np
from sklearn.cluster import DBSCAN
from django.utils import timezone

@shared_task
def remove_video(video_id,channel_id):
    from .models import Video
    from users.tasks import refresh_user_stats
    Video.objects.filter(id=video_id,channel_id=channel_id).delete()
    refresh_user_stats.delay(channel_id)

@shared_task
def refresh_video_rates(video_id):
    from .models import Video,UserVideoRelation
    from users.tasks import refresh_user_stats
    video = Video.objects.get(id=video_id)
    video.baseStars = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()
    # refresh_total_rates.delay(video.channel_id)
    refresh_user_stats.delay(video.channel_id)


@shared_task
def refresh_comment_rates(comment_id):
    from .models import CommentVideo,UserCommentRelation
    try:
        comment = CommentVideo.objects.get(id=comment_id)
        # Считаем рейтинг комментария (например, количество лайков)
        comment.baseStars = UserCommentRelation.objects.filter(comment_id=comment_id, grade=1).count()
        comment.save(update_fields=['baseStars'])
        # Обновляем статистику пользователя/автора комментария
        
    except CommentVideo.DoesNotExist:
        pass  # если комментарий удалён, игнорируем


@shared_task
def video_encode(duration,video_id):
    import subprocess
    import os
    import json
    from time import sleep
    from django.core.files import File
    from .models import Video

    try:
        sleep(duration)
        obj = Video.objects.filter(status='Pending',id=video_id).first()
        if obj:
            obj.status = 'Processing'
            obj.is_running = True
            obj.save()
            input_video_path = obj.src.path
            output_directory = os.path.join(os.path.dirname(input_video_path), 'hls_output')
            os.makedirs(output_directory, exist_ok=True)
            output_filename = os.path.splitext(os.path.basename(input_video_path))[0] + '_hls.m3u8'
            output_hls_path = os.path.join(output_directory, output_filename)
            output_thumbnail_path = os.path.join(output_directory, os.path.splitext(os.path.basename(input_video_path))[0]+'thumbnail.jpg')

            # getting video duration/length

            command = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_streams",
                
                input_video_path
            ]
            result = subprocess.run(command, shell=False,
                                    check=True, stdout=subprocess.PIPE)
            output_json = json.loads(result.stdout)

            video_length = None
            for stream in output_json['streams']:
                if stream['codec_type'] == 'video':
                    video_length = float(stream['duration'])
                    break

            if video_length is not None:
                obj.duration = video_length
            

            # Use ffmpeg to create HLS segments
            cmd = [
                'ffmpeg',
                '-i', input_video_path,
                '-c:v', 'h264',
                '-c:a', 'aac',
                '-hls_time', '5',
                '-hls_list_size', '0',
                "-hls_base_url", "{{ dynamic_path }}/",
                "-movflags", "+faststart",
                '-y',
                output_hls_path
            ]


            subprocess.run(cmd, check=True)
            
            if not obj.thumbnail:
                # generate thumbnail 
                ffmpeg_cmd = [
                    'ffmpeg',
                    '-i', input_video_path,
                    '-ss', '2', 
                    '-vframes', '1',            
                    '-q:v', '2',  
                    '-y',               
                    output_thumbnail_path
                ]
                subprocess.run(ffmpeg_cmd, check=True)
                obj.thumbnail = output_thumbnail_path
                with open(output_thumbnail_path, 'rb') as f:
                    obj.thumbnail.save(f'{obj.title}_{obj.id}.jpg', File(f))
            
            # Update the Video object status to 'Processed' or something similar
            obj.hls = output_hls_path 
            obj.status = 'Completed'
            obj.is_running = False
            obj.save()

            print(f'HLS segments generated and saved at: {output_hls_path}')
        else:
            print('No video with status "Pending" found.')
        return True 

    except Exception as e:
        print(e)

        return False 
    





@shared_task
def update_video_embedding(video_id):
    from django.core.exceptions import ObjectDoesNotExist
    from .models import Video
    from ml.encode import format_video_text
    from ml.encode import encode_text

    try:
        video = Video.objects.select_related('channel').get(id=video_id)
    except ObjectDoesNotExist:
        return

    text = format_video_text(video)
    full_embedding = encode_text(text)
    video.video_embedding = full_embedding

    video.save(update_fields=['video_embedding'], update_embedding=False)


# ===== Moved from watch.tasks =====
import logging
import numpy as np
from sklearn.cluster import DBSCAN
from django.utils import timezone


@shared_task
def refresh_history(video_id, viewer_id):
    from .models import WatchHistory
    obj, created = WatchHistory.objects.get_or_create(
        video_id=video_id,
        viewer_id=viewer_id,
        defaults={'watch_time': timezone.now()}
    )

    if not created:
        obj.watch_time = timezone.now()
        obj.save()
    compute_and_save_user_embeddings.delay(viewer_id)


@shared_task
def refresh_views(video_id):
    from django.db.models import F
    from .models import Video
    video = Video.objects.get(id=video_id)
    video.views = F('views') + 1
    video.save()


@shared_task
def update_video_rate(video_id, channel_id):
    from .models import UserVideoRelation
    user_video_relation = UserVideoRelation.objects.get(video_id=video_id, user_id=channel_id)
    user_video_relation.grade = not user_video_relation.grade
    user_video_relation.save()
    refresh_video_rates.delay(video_id)


logger = logging.getLogger(__name__)


@shared_task
def compute_and_save_user_embeddings(user_id, eps=0.08, min_samples=2):
    from users.models import User
    from .models import WatchHistory
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"User {user_id} does not exist.")
        return

    history = (
        WatchHistory.objects
        .filter(viewer_id=user.id)
        .select_related('video')
        .only('video__id', 'video__title', 'video__video_embedding')
    )

    embeddings = []
    video_info = []
    for item in history:
        emb = item.video.video_embedding
        if emb is not None:
            embeddings.append(emb)
            video_info.append((item.video.id, getattr(item.video, "title", None)))

    if not embeddings:
        user.user_embeddings = None
        user.save(update_fields=['user_embeddings'])
        logger.info(f"No embeddings found for user {user_id}. Cleared user_embeddings.")
        return

    X = np.array(embeddings, dtype=np.float32)
    clustering = DBSCAN(eps=eps, min_samples=min_samples, metric='cosine').fit(X)
    labels = clustering.labels_

    for (vid, title), label in zip(video_info, labels):
        if label == -1:
            logger.info(f"User {user_id} | Video {vid} ('{title}') → Noise")
        else:
            logger.info(f"User {user_id} | Video {vid} ('{title}') → Cluster {label}")

    clusters = {}
    for label, emb in zip(labels, X):
        if label == -1:
            continue
        clusters.setdefault(label, []).append(emb)

    result = []
    for label, cluster_embs in clusters.items():
        mean_vector = np.mean(cluster_embs, axis=0)
        result.append({
            "cluster_id": int(label),
            "mean_vector": mean_vector.tolist(),
            "count": len(cluster_embs)
        })

    user.user_embeddings = result
    user.save(update_fields=['user_embeddings'])
    logger.info(f"User {user_id} embeddings updated. Found {len(clusters)} clusters.")

