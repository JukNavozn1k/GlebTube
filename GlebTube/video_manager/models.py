from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from django.contrib.auth.models import User

from django.conf import settings
from django.core.cache import cache
from . import tasks
class Video(models.Model):

    PENDING = 'Pending'
    PROCESSING = 'Processing'
    COMPLETED = 'Completed'
    
    STATUS_CHOICES = (
        (PENDING, 'Pending'),
        (PROCESSING, 'Processing'),
        (COMPLETED, 'Completed'),
    )

    id = models.BigAutoField(primary_key=True)
    caption = models.CharField(max_length=64,null = False,verbose_name="Название")
    description = models.TextField(max_length=1024,verbose_name="Описание",blank=True,null=True)

    thumbnail = models.ImageField(upload_to="thumbnails",null=True,blank=True,verbose_name='Превью')
    video = models.FileField(upload_to='videos',null=True,
    validators=[FileExtensionValidator(allowed_extensions=['mp4'])],verbose_name="Видео")
    
    
    duration = models.CharField(max_length=20, blank=True,null=True,verbose_name='Длительность')
    hls = models.CharField(max_length=500,blank=True,null=True,verbose_name='HLS')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING,verbose_name='Статус')
    is_running = models.BooleanField(default=False, verbose_name='В обработке')

    # Cache fields
    views = models.PositiveBigIntegerField(default=0,verbose_name="Количество просмотров")
    stars_count = models.PositiveBigIntegerField(default=0,verbose_name='Количество звёзд')

    date_uploaded = models.DateTimeField(default=timezone.now,verbose_name="Дата публикации")
    author = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name="Автор")

    def delete(self,*args,**kwargs):
        cache.delete(settings.CACHE_ALL_VIDEO_QUERYSET)
        super().delete(*args,**kwargs)
    
    def save(self,*args,**kwargs):
        cache.delete(settings.CACHE_ALL_VIDEO_QUERYSET)
        super().save(*args,**kwargs)
    class Meta: 
        verbose_name = 'Видео'
        verbose_name_plural = verbose_name
    def __str__(self) -> str:
        return f"Id: {self.id} Caption: {self.caption}"

class UserVideoRelation(models.Model):

    CHOICES = [(0, 'Без оценки'), (1, 'С оценкой')]
   
    user = models.ForeignKey(User,on_delete=models.CASCADE,verbose_name="Зритель")
    grade = models.BooleanField(default=0,choices=CHOICES,verbose_name="Оценка")
    video = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео",related_name='rates')
    def __str__(self) -> str:
        return f'{self.id} : {self.user} -> {self.CHOICES[self.grade][1]}'
    class Meta:
        verbose_name = 'Пользователь-видео'
        verbose_name_plural = 'Пользователи-видео'

        unique_together = ['video', 'user']
    
    def save(self,*args,**kwargs):
        tasks.refresh_rates.delay(self.video.id)
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
    instance = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео",db_index=True)
    class Meta:
         verbose_name = 'Комментарий-Видео'
         verbose_name_plural = 'Коментарии-Видео'