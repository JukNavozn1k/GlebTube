from celery import shared_task
@shared_task
def refresh_user_stats(author_id):
    from videos.models import UserVideoRelation
    from .models import Subscription
    from auths.models import User
    baseStars =  UserVideoRelation.objects.filter(video__author_id=author_id,grade=1).count()
    additonal, created = User.objects.get_or_create(id=author_id)
    additonal.baseStars=baseStars 
    additonal.subscriberCount = Subscription.objects.filter(author_id=author_id,active=True).count()
    additonal.save()
    
    



