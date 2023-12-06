from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from django.contrib.auth.models import User

# from polymorphic.models import PolymorphicModel

class Video(models.Model):
    id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=64,null = False)
    description = models.TextField(max_length=1024)

    img = models.ImageField(upload_to='images_uploaded',null=True)
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])])
    
    views = models.PositiveBigIntegerField(default=0)
    date_uploaded = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE)


class History(models.Model):
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE)
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
       

# Rating models
class Rate(models.Model):
    content = models.Field()
    author = models.ForeignKey(User,on_delete=models.CASCADE)
    grade = models.IntegerField(default=0,choices=[(-1, 'Dislike'), (0, 'None'), (1, 'Like')])
    
    class Meta:
        unique_together = ['content', 'author']
        abstract = True

class RateVideo(Rate):
    content = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Video")
    pass


   

# Comment models
class Comment(models.Model):
    instance = models.Field()
    author = models.ForeignKey(User,on_delete=models.CASCADE)
    content = models.TextField(null=False)
    date_uploaded = models.DateTimeField(default=timezone.now)
    class Meta:
        # unique_together = ['instance', 'author'] user can send many comments to one video/comment
        abstract = True
class CommentVideo(Comment):
    instance = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Video")