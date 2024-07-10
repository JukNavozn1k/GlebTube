from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from django.contrib.auth.models import User

class Video(models.Model):
    id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=64,null = False,verbose_name="Название")
    description = models.TextField(max_length=1024,verbose_name="Описание")

    img = models.ImageField(upload_to='images_uploaded',null=True,verbose_name="Превью")
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])],verbose_name="Видео")
    
    views = models.PositiveBigIntegerField(default=0,verbose_name="Количество просмотров")
    date_uploaded = models.DateTimeField(default=timezone.now,verbose_name="Дата публикации")
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name="Автор")

    def __str__(self) -> str:
        return f"Id: {self.id} Caption: {self.caption}"


# Rating models
class Rate(models.Model):
    content = models.Field()
    author = models.ForeignKey(User,on_delete=models.CASCADE,verbose_name="Автор")
    grade = models.IntegerField(default=0,choices=[(-1, 'Dislike'), (0, 'None'), (1, 'Like')],verbose_name="Оценка")
    
    class Meta:
        unique_together = ['content', 'author']
        abstract = True

class RateVideo(Rate):
    content = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео")
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
    instance = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео")