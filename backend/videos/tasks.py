from celery import shared_task
from .semantic_search import encode_titles, tokenizer, model, encode_title
import torch
@shared_task
def remove_video(video_id,author_id):
    from .models import Video
    from profiles.tasks import refresh_user_stats
    Video.objects.filter(id=video_id,author_id=author_id).delete()
    refresh_user_stats.delay(author_id)

@shared_task
def refresh_rates(video_id):
    from .models import Video,UserVideoRelation
    from profiles.tasks import refresh_user_stats
    video = Video.objects.get(id=video_id)
    video.baseStars = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()
    # refresh_total_rates.delay(video.author_id)
    refresh_user_stats.delay(video.author_id)



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
    from .semantic_match import format_video_text
    try:
        video = Video.objects.select_related('author').get(id=video_id)
    except ObjectDoesNotExist:
        return
    search_embedding = encode_title(video.title or '')
    video.search_embedding = search_embedding

    text = format_video_text(video)
    print(text)
    full_embedding = encode_title(text)
    video.video_embedding = full_embedding

    video.save(update_fields=['search_embedding', 'video_embedding'], update_embedding=False)

