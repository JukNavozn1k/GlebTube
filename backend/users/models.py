from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    bio = models.TextField(max_length=1024,verbose_name='Описание',blank=True,null=True,default='')
    avatar = models.ImageField(upload_to='user_avatars',verbose_name='Аватар',null=True,blank=True)

    baseStars = models.PositiveBigIntegerField(default=0, verbose_name='Количество звёзд')
    subscriberCount = models.PositiveBigIntegerField(default=0, verbose_name='Количество подписчиков')

    user_embeddings = models.JSONField(null=True, blank=True, verbose_name='Кластеры эмбеддингов')
    
    joinedAt = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self) -> str:
        full_name = f"{self.first_name} {self.last_name}".strip()
        if full_name:
            return f"{full_name} (@{self.username})"
        return self.username or f"User#{self.pk}"


class Subscription(models.Model):
      '''
            Allows you to register subscriptions. 
            Unsubscription is performed by deleting records
      '''
      subscriber = models.ForeignKey(User,on_delete=models.CASCADE,related_name='subscriptions',verbose_name='Подписчик')
      channel = models.ForeignKey(User,on_delete=models.CASCADE,related_name='subscribers',verbose_name='Автор')
      active = models.BooleanField(verbose_name='Подписка активна',default=False)
      class Meta:
            constraints = [
                  models.UniqueConstraint(fields=['subscriber', 'channel'], name='unique_users_sub')
            ]
            verbose_name = 'Подписка'
            verbose_name_plural = 'Подписки'
      
      def __str__(self) -> str:
          return f'{self.subscriber} -> {self.channel}'
      def clean(self):
        if self.channel == self.subscriber:
            from django.core.exceptions import ValidationError
            raise ValidationError("User and linked user cannot be the same.")