from celery import shared_task

from django.utils import timezone

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




