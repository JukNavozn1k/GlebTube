from django.db import models

from django.contrib.auth.models import User
from video_manager.models import Video

from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.
class History(models.Model):
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE)
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
  
class UserAdditional(models.Model):
      user = models.OneToOneField(User,unique=True,on_delete=models.CASCADE)
      profile_description = models.TextField(max_length=1024,default='Здесь будет замечательное описание, когда-нибудь... ')
      avatar = models.ImageField(upload_to='user_avatars',default='user_avatars/default.png')


# auto creating additional model connected to user
@receiver(post_save, sender=User)
def create_additional(sender, instance, created, **kwargs):
    if created:
        UserAdditional.objects.create(user=instance)

post_save.connect(create_additional, sender=User)
       
