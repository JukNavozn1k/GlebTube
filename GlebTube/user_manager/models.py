from django.db import models

from django.contrib.auth.models import User
from video_manager.models import Video

from django.dispatch import receiver
from django.db.models.signals import post_save


from django.core.exceptions import ValidationError

class WatchHistory(models.Model):
      '''
          Allows you to record your watch history.
      '''
      viewer = models.ForeignKey(User,null=True,on_delete=models.CASCADE,verbose_name='Зритель')
      video = models.ForeignKey(Video,null=True,on_delete=models.CASCADE,verbose_name='Видео')
      class Meta:
        verbose_name = 'Просмотр'
        verbose_name_plural = 'История просмотров'

class UserAdditional(models.Model):
      '''
            Allows you to augment the user entity with additional attributes 
            without modifying the standard User class
      '''
      user = models.OneToOneField(User,unique=True,on_delete=models.CASCADE,verbose_name='Пользователь',related_name='additional')
      profile_description = models.TextField(max_length=1024,verbose_name='Описание',blank=True,null=True)
      avatar = models.ImageField(upload_to='user_avatars',verbose_name='Аватар',null=True,blank=True)

      stars_count = models.PositiveBigIntegerField(default=0,verbose_name='Количество звёзд')
      subscribers_count = models.PositiveBigIntegerField(default=0,verbose_name='Количество подписчкиков')
      class Meta: 
          verbose_name = 'Дополнение к пользователю'
          verbose_name_plural = 'Дополнения к пользователям'
      def __str__(self) -> str:
          return f'{self.user} -> Дополнение'



class Subscription(models.Model):
      '''
            Allows you to register subscriptions. 
            Unsubscription is performed by deleting records
      '''
      subscriber = models.ForeignKey(User,on_delete=models.CASCADE,related_name='subscriber',verbose_name='Подписчик')
      author = models.ForeignKey(User,on_delete=models.CASCADE,related_name='author',verbose_name='Автор')
      active = models.BooleanField(verbose_name='Подписка активна',default=False)
      class Meta:
            constraints = [
                  models.UniqueConstraint(fields=['subscriber', 'author'], name='unique_users')
            ]
            verbose_name = 'Подписка'
            verbose_name_plural = 'Подписки'
      
      def __str__(self) -> str:
          return f'{self.subscriber} -> {self.author}'
      def clean(self):
        if self.author == self.subscriber:
            raise ValidationError("User and linked user cannot be the same.")

