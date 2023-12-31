from django.db import models

from django.contrib.auth.models import User
from video_manager.models import Video

from django.dispatch import receiver
from django.db.models.signals import post_save


from django.core.exceptions import ValidationError

class History(models.Model):
      '''
          Allows you to record your watch history.
      '''
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE)
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
  
class UserAdditional(models.Model):
      '''
            Allows you to augment the user entity with additional attributes 
            without modifying the standard User class
      '''
      user = models.OneToOneField(User,unique=True,on_delete=models.CASCADE)
      profile_description = models.TextField(max_length=1024,default='Здесь будет замечательное описание, когда-нибудь... ')
      avatar = models.ImageField(upload_to='user_avatars',default='user_avatars/default.png')



class Subscription(models.Model):
      '''
            Allows you to register subscriptions. 
            Unsubscription is performed by deleting records
      '''
      subscriber = models.ForeignKey(User,unique=True,on_delete=models.CASCADE,related_name='subscriber')
      author = models.ForeignKey(User,unique=True,on_delete=models.CASCADE,related_name='author')
      class Meta:
            constraints = [
                  models.UniqueConstraint(fields=['subscriber', 'author'], name='unique_users')
            ]
      def clean(self):
        if self.author == self.subscriber:
            raise ValidationError("User and linked user cannot be the same.")


# Automatically binds User Additional proxy to User
@receiver(post_save, sender=User)
def create_additional(sender, instance, created, **kwargs):
    if created:
        UserAdditional.objects.create(user=instance)

post_save.connect(create_additional, sender=User)
       
