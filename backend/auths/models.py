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