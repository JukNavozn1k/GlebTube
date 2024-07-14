from celery import shared_task
from .models import Video,RateVideo

from django.db.models import F

# inc view count and adds to hist if user is authenticated
@shared_task
def refresh_stats(video_id):
    video = Video.objects.get(id=video_id)
    video.views = F('views') + 1
    video.stars_count = RateVideo.objects.filter(grade=1,content__id=video_id).count()
    video.save()
 