from celery import shared_task

@shared_task
def clear_history(user_id):
    from . import models
    models.WatchHistory.objects.filter(viewer__id=user_id).delete()