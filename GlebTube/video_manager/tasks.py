from celery import shared_task
from .models import Video,RateVideo
from user_manager.models import History

# inc view count and adds to hist if user is authenticated
@shared_task
def statVideo(video_id,user_id=None):
    video = Video.objects.get(Video,id=video_id)
    video.views += 1
    video.stars_count = RateVideo.objects.filter(content=video,grade=1).count()
    video.save()
    if not (user_id is None): 
            History.objects.create(viewer__id=user_id,video=video)