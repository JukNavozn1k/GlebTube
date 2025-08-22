from django.db import models

from django.core.validators import FileExtensionValidator
from django.utils import timezone

from users.models import User

from django.core.exceptions import ValidationError
from django.db.models import JSONField


from . import tasks

def validate_probability(value):
    if not (0 <= value <= 1):
        raise ValidationError('Probability must be between 0 and 1')

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
    title = models.CharField(max_length=64,null = False,verbose_name="Название",db_index=True)
    description = models.TextField(max_length=1024,verbose_name="Описание",blank=True,null=True)

    thumbnail = models.ImageField(upload_to="thumbnails",null=True,blank=True,verbose_name='Превью')
    src = models.FileField(upload_to='videos',null=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4'])],verbose_name="Видео")
    
    
    duration = models.CharField(max_length=20, blank=True,null=True,verbose_name='Длительность')
    hls = models.CharField(max_length=500,blank=True,null=True,verbose_name='HLS')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING,verbose_name='Статус')
    is_running = models.BooleanField(default=False, verbose_name='В обработке')

    # Cache fields
    views = models.PositiveBigIntegerField(default=0,verbose_name="Количество просмотров")
    baseStars = models.PositiveBigIntegerField(default=0,verbose_name='Количество звёзд')

    createdAt = models.DateTimeField(default=timezone.now,verbose_name="Дата публикации")
    channel = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name="Автор",related_name='user_videos')

    video_embedding = JSONField(null=True, blank=True, verbose_name='Эмбеддинг видео')


    def save(self, *args, update_embedding=True, **kwargs):
        super().save(*args, **kwargs)
        if update_embedding:
            from .tasks import update_video_embedding
            update_video_embedding.delay(self.id)

    class Meta: 
        verbose_name = 'Видео'
        verbose_name_plural = verbose_name
    def __str__(self) -> str:
        return f"Id: {self.id} title: {self.title}"

class UserVideoRelation(models.Model):

    CHOICES = [(0, 'Без оценки'), (1, 'С оценкой')]
   
    user = models.ForeignKey(User,on_delete=models.CASCADE,verbose_name="Зритель")
    grade = models.BooleanField(default=0,choices=CHOICES,verbose_name="Оценка")
    video = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео",related_name='video_rates')
    def __str__(self) -> str:
        return f'{self.id} : {self.user} -> {self.CHOICES[self.grade][1]}'
    class Meta:
        verbose_name = 'Пользователь-видео'
        verbose_name_plural = 'Пользователи-видео'

        unique_together = ['video', 'user']
    


    
class CommentVideo(models.Model):
    video = models.ForeignKey(Video,on_delete=models.CASCADE,verbose_name="Видео",related_name='video_comments')
    channel = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user_comments')
    text = models.TextField(null=False,blank=False,verbose_name='Контент')
    baseStars = models.PositiveBigIntegerField(default=0,verbose_name='Количество звёзд')
    parent = models.ForeignKey(
        'self',  # ссылка на ту же модель
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name='Родительский комментарий'
    )
    
    
    createdAt = models.DateTimeField(default=timezone.now)
    class Meta:
         verbose_name = 'Комментарий-Видео'
         verbose_name_plural = 'Коментарии-Видео'
    def clean(self):
        if self.parent:
            if self.parent.video_id != self.video_id:
                raise ValidationError("Родительский комментарий должен быть того же видео.")
            if self.parent.parent is not None:
                raise ValidationError("Можно создавать только один уровень вложенности комментариев.")

    def save(self, *args, **kwargs):
        # при сохранении в коде вне админки, лучше всё равно вызывать clean()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.id} : {self.channel} -> {self.video}'
    
class UserCommentRelation(models.Model):
    CHOICES = [(0, 'Без оценки'), (1, 'С оценкой')]
   
    user = models.ForeignKey(User,on_delete=models.CASCADE,verbose_name="Пользователь")
    grade = models.BooleanField(default=0,choices=CHOICES,verbose_name="Оценка")
    comment = models.ForeignKey(CommentVideo,on_delete=models.CASCADE,verbose_name="Комментарий",related_name='comment_rates')


    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Вызываем таску для пересчёта рейтинга комментария
        tasks.refresh_comment_rates.delay(self.comment_id)

    def __str__(self) -> str:
        return f'{self.id} : {self.user} -> {self.CHOICES[self.grade][1]}'
    class Meta:
        verbose_name = 'Пользователь-комментарий'
        verbose_name_plural = 'Пользователи-комментарии'

        unique_together = ['comment', 'user']
    

class WatchHistory(models.Model):
      '''
          Allows you to record your watch history.
      '''
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name='Зритель',related_name='watch_history')
      video = models.ForeignKey('Video',null=True,on_delete=models.CASCADE,verbose_name='Видео')
      watch_time = models.DateTimeField(
        verbose_name='Время просмотра',
        auto_now_add=True
      )
      def __str__(self):
            return f"{self.viewer} смотрел '{self.video.title}' в {self.watch_time.strftime('%Y-%m-%d %H:%M')}"
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
        unique_together = ('viewer', 'video')
        db_table = 'profiles_watchhistory'
