from celery import shared_task
from .models import Video,UserVideoRelation

from django.db.models import F

# inc view count and adds to hist if user is authenticated
@shared_task
def refresh_stats(video_id):
    video = Video.objects.get(id=video_id)
    video.views = UserVideoRelation.objects.filter(video__id=video_id).count()
    video.stars_count = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()
 