from celery import shared_task

@shared_task
def refresh_history(video_id,viewer_id):
    from user_manager.models import WatchHistory
    new_watch = WatchHistory(video_id=video_id,viewer_id=viewer_id)
    new_watch.save()

@shared_task
def refresh_views(video_id):
    from .models import Video
    from django.db.models import F
    video = Video.objects.get(id=video_id)
    video.views = F('views') + 1
    video.save()

@shared_task
def refresh_rates(video_id):
    from .models import Video,UserVideoRelation
    video = Video.objects.get(id=video_id)
    video.stars_count = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()

@shared_task
def remove_comment(comment_id,author_id):
    from .models import CommentVideo
    CommentVideo.objects.filter(id=comment_id,author__id = author_id).delete()

@shared_task
def post_comment(video_id,author_id,comment):
    from .models import CommentVideo
    new_comment = CommentVideo(author_id=author_id,instance_id=video_id,content=comment)
    new_comment.save()



@shared_task
def video_encode(duration,video_id):
    import subprocess
    import os
    import json
    from time import sleep

    from .models import Video

    try:
        sleep(duration)
        obj = Video.objects.filter(status='Pending',id=video_id).first()
        if obj:
            obj.status = 'Processing'
            obj.is_running = True
            obj.save()
            input_video_path = obj.video.path
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