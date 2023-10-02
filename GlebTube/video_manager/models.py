from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from django.contrib.auth.models import User

class Video(models.Model):
    video_id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=32,null = False)
    description = models.TextField(max_length=1024)
    img = models.ImageField(upload_to='images_uploaded',null=True)
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])])
    date_uploaded = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE)
