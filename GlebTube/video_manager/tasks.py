from celery import shared_task
from .models import Video

# inc view count and adds to hist if user is authenticated
@shared_task
def inc_views(video_id):
    video = Video.objects.get(id=video_id)
    video.views += 1
    video.save()
 