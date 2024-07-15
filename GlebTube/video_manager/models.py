from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from django.contrib.auth.models import User

from . import tasks

class Video(models.Model):
    id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=64,null = False,verbose_name="Название")
    description = models.TextField(max_length=1024,verbose_name="Описание")

    img = models.ImageField(upload_to='images_uploaded',null=True,verbose_name="Превью")
    video = models.FileField(upload_to='videos_uploaded',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['MOV','avi','mp4','webm','mkv'])],verbose_name="Видео")
    
    views = models.PositiveBigIntegerField(default=0,verbose_name="Количество просмотров")
    stars_count = models.PositiveBigIntegerField(default=0,verbose_name='Количество звёзд')
    date_uploaded = models.DateTimeField(default=timezone.now,verbose_name="Дата публикации")
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name="Автор")

    class Meta: 
        verbose_name = 'Видео'
        verbose_name_plural = verbose_name
    def __str__(self) -> str:
        return f"Id: {self.id} Caption: {self.caption}"

class UserVideoRelation(models.Model):

    CHOICES = [(0, 'Без оценки'), (1, 'С оценкой')]
    author = models.ForeignKey(User,on_delete=models.CASCADE,verbose_name="Автор")
    grade = models.BooleanField(default=0,choices=CHOICES,verbose_name="Оценка")
    video = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео",related_name='rates')
    def __str__(self) -> str:
        return f'{self.id} : {self.author} -> {self.grade}'
    class Meta:
        verbose_name = 'Рейтинг видео'
        unique_together = ['video', 'author']
        verbose_name_plural = verbose_name
    def save(self,*args,**kwargs):
        tasks.refresh_stats(self.video.id)
        super().save(*args,**kwargs)

# Comment models
class Comment(models.Model):
    instance = models.Field()
    author = models.ForeignKey(User,on_delete=models.CASCADE)
    content = models.TextField(null=False)
    date_uploaded = models.DateTimeField(default=timezone.now)
    class Meta:
        # unique_together = ['instance', 'author'] user can send many comments to one video/comment
        abstract = True
    def __str__(self) -> str:
        return f'{self.id} : {self.author} -> {self.instance}'
class CommentVideo(Comment):
    instance = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео")
    class Meta:
         verbose_name = 'Комментарий под видео'
         verbose_name_plural = 'Коментарии под видео'