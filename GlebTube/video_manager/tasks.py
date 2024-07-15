from celery import shared_task

@shared_task
def add_view(video_id,viewer_id):
    from user_manager.models import WatchHistory
    new_watch = WatchHistory(video_id=video_id,viewer_id=viewer_id)
    new_watch.save()

@shared_task
def create_user_video_relation(video_id,user_id):
    from .models import UserVideoRelation
    UserVideoRelation.objects.get_or_create(video_id=video_id,user_id=user_id)
    refresh_stats.delay(video_id)

# updates views & stars count models.Video
@shared_task
def refresh_stats(video_id):
    from .models import Video,UserVideoRelation
    video = Video.objects.get(id=video_id)
    video.views = UserVideoRelation.objects.filter(video__id=video_id).count()
    video.stars_count = UserVideoRelation.objects.filter(grade=1,video__id=video_id).count()
    video.save()

