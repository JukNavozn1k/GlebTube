from django.db import models

# Create your models here.
from django.db import models

from auths.models import User
from videos.models import Video

from django.core.exceptions import ValidationError
from django.utils import timezone
class WatchHistory(models.Model):
      '''
          Allows you to record your watch history.
      '''
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name='Зритель',related_name='watch_history')
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE,verbose_name='Видео')
      watch_time = models.DateTimeField(
        verbose_name='Время просмотра',
        auto_now_add=True
    )
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'
        unique_together = ('viewer', 'video')

class Subscription(models.Model):
      '''
            Allows you to register subscriptions. 
            Unsubscription is performed by deleting records
      '''
      subscriber = models.ForeignKey(User,on_delete=models.CASCADE,related_name='subscriptions',verbose_name='Подписчик')
      author = models.ForeignKey(User,on_delete=models.CASCADE,related_name='subscribers',verbose_name='Автор')
      active = models.BooleanField(verbose_name='Подписка активна',default=False)
      class Meta:
            constraints = [
                  models.UniqueConstraint(fields=['subscriber', 'author'], name='unique_users_sub')
            ]
            verbose_name = 'Подписка'
            verbose_name_plural = 'Подписки'
      
      def __str__(self) -> str:
          return f'{self.subscriber} -> {self.author}'
      def clean(self):
        if self.author == self.subscriber:
            raise ValidationError("User and linked user cannot be the same.")

