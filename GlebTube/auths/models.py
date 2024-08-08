from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    profile_description = models.TextField(max_length=1024,verbose_name='Описание',blank=True,null=True,default='')
    avatar = models.ImageField(upload_to='user_avatars',verbose_name='Аватар',null=True,blank=True)

    stars_count = models.PositiveBigIntegerField(default=0, verbose_name='Количество звёзд')
    subs_count = models.PositiveBigIntegerField(default=0, verbose_name='Количество подписчиков')
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'