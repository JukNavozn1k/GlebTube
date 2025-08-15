from celery import shared_task

from django.utils import timezone

import numpy as np
from profiles.models import WatchHistory
from sklearn.cluster import DBSCAN
from auths.models import User
import logging

@shared_task
def refresh_history(video_id, viewer_id):
    from profiles.models import WatchHistory
    obj, created = WatchHistory.objects.get_or_create(
        video_id=video_id,
        viewer_id=viewer_id,
        defaults={'watch_time': timezone.now()}
    )
    if not created:
        # Если объект уже существует — обновляем время просмотра
        obj.watch_time = timezone.now()
        obj.save()
    compute_and_save_user_embeddings.delay(viewer_id)

@shared_task
def refresh_views(video_id):
    from videos.models import Video
    from django.db.models import F
    video = Video.objects.get(id=video_id)
    video.views = F('views') + 1
    video.save()

@shared_task
def update_video_rate(video_id,author_id):
    from videos.models import UserVideoRelation
    from videos.tasks import refresh_rates
    user_video_relation = UserVideoRelation.objects.get(video_id=video_id, user_id=author_id)
    user_video_relation.grade = not user_video_relation.grade
    user_video_relation.save()
    refresh_rates.delay(video_id)


logger = logging.getLogger(__name__)

@shared_task
def compute_and_save_user_embeddings(user_id, eps=0.08, min_samples=2):
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
    video_info = []  # список кортежей (video_id, title)
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

    # Логируем, какие видео куда попали
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