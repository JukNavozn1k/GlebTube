from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone


class Video(models.Model):
    caption = models.CharField(max_length=32,null = False)
    description = models.TextField(max_length=1024)
    img = models.ImageField(upload_to='images_uploaded',null=True)
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])])
    date_uploaded = models.DateTimeField(default=timezone.now)
    # user = models.ForeignKey(User,on_delete= models.CASCADE) someday...