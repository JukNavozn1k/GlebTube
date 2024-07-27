from celery import shared_task

@shared_task
def clear_history(user_id):
    from . import models
    models.WatchHistory.objects.filter(viewer__id=user_id).delete()

@shared_task
def update_subscription(user_id,author_id):
    from .models import Subscription
    sub = Subscription.objects.get(subscriber_id=user_id,author_id=author_id)
    sub.active = not sub.active
    sub.save()
    refresh_subs_count.delay(author_id)
    
    
@shared_task
def refresh_subs_count(author_id):
    from .models import Subscription,UserAdditional
    additional,created = UserAdditional.objects.get_or_create(user_id=author_id)
    additional.subs_count = Subscription.objects.filter(author_id=author_id,active=True).count()
    additional.save()
    
