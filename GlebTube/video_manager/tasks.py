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
    from django.db.models import F
    video = Video.objects.get(id=video_id)
    video.stars_count = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()
