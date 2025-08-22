from celery import shared_task
@shared_task
def refresh_user_stats(channel_id):
    from videos.models import UserVideoRelation
    from .models import Subscription
    from users.models import User
    baseStars =  UserVideoRelation.objects.filter(video__channel_id=channel_id,grade=1).count()
    additonal, created = User.objects.get_or_create(id=channel_id)
    additonal.baseStars=baseStars 
    additonal.subscriberCount = Subscription.objects.filter(channel_id=channel_id,active=True).count()
    additonal.save()
    
    



