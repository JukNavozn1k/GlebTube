from django.db import models

from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

from django.utils import timezone

from django.contrib.auth.models import User

class Video(models.Model):
    id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=32,null = False)
    description = models.TextField(max_length=1024)

    img = models.ImageField(upload_to='images_uploaded',null=True)
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])])
    
    views = models.PositiveBigIntegerField(default=0)
    date_uploaded = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE)

class RateVideo(models.Model):
    def validate_three_values(self,value):
        if value not in [-1, 0, 1]:
            raise ValidationError("Invalid value. Please choose -1, 0, or 1.")
        
    video = models.ForeignKey(Video,on_delete=models.CASCADE)
    author = models.ForeignKey(User,on_delete=models.CASCADE)
    grade = models.IntegerField(default=0, validators=[validate_three_values])
    
    class Meta:
        unique_together = ['video', 'author']