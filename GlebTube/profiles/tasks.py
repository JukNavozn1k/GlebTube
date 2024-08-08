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
    refresh_user_stats.delay(author_id)
    
    
@shared_task
def refresh_user_stats(author_id):
    from videos.models import UserVideoRelation
    from .models import Subscription
    from auths.models import User
    stars_count =  UserVideoRelation.objects.filter(video__author_id=author_id,grade=1).count()
    additonal, created = User.objects.get_or_create(id=author_id)
    additonal.stars_count=stars_count 
    additonal.subs_count = Subscription.objects.filter(author_id=author_id,active=True).count()
    additonal.save()
    