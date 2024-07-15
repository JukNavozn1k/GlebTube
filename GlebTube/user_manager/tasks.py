from celery import shared_task

@shared_task
def refresh_user_stats(author_id):
    from .models import Subscription,UserAdditional
    from video_manager.models import UserVideoRelation,Video

    stars_count = UserVideoRelation.objects.all().filter(grade=1,video__in = Video.objects.filter(author__id=author_id)).count()
    subscribers_count = Subscription.objects.all().filter(author__id = author_id,active=True).count()

    additional = UserAdditional.objects.get(user_id=author_id)
    additional.subscribers_count = subscribers_count
    additional.stars_count = stars_count
    additional.save()