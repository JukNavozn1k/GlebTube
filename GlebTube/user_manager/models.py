from django.db import models

from django.contrib.auth.models import User
from video_manager.models import Video

# Create your models here.
class History(models.Model):
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE)
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
  
class UserAdditional(models.Model):
      user = models.ForeignKey(User,unique=True,on_delete=models.CASCADE)
      profile_description = models.TextField(max_length=1024)
      avatar = models.ImageField(upload_to='images_uploaded',null=True)