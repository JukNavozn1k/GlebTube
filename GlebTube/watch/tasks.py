from celery import shared_task

@shared_task
def refresh_history(video_id,viewer_id):
    from profiles.models import WatchHistory
    new_watch = WatchHistory(video_id=video_id,viewer_id=viewer_id)
    new_watch.save()

@shared_task
def refresh_views(video_id):
    from videos.models import Video
    from django.db.models import F
    video = Video.objects.get(id=video_id)
    video.views = F('views') + 1
    video.save()


@shared_task
def remove_comment(comment_id,author_id):
    from videos.models import CommentVideo
    CommentVideo.objects.filter(id=comment_id,author__id = author_id).delete()

@shared_task
def update_video_rate(video_id,author_id):
    from videos.models import UserVideoRelation
    from videos.tasks import refresh_rates
    user_video_relation = UserVideoRelation.objects.get(video_id=video_id, user_id=author_id)
    user_video_relation.grade = not user_video_relation.grade
    user_video_relation.save()
    refresh_rates.delay(video_id)




