# Generated by Django 4.2.14 on 2024-08-08 13:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auths', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'verbose_name': 'Пользователь', 'verbose_name_plural': 'Пользователи'},
        ),
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='user_avatars', verbose_name='Аватар'),
        ),
        migrations.AddField(
            model_name='user',
            name='profile_description',
            field=models.TextField(blank=True, default='', max_length=1024, null=True, verbose_name='Описание'),
        ),
        migrations.AddField(
            model_name='user',
            name='stars_count',
            field=models.PositiveBigIntegerField(default=0, verbose_name='Количество звёзд'),
        ),
        migrations.AddField(
            model_name='user',
            name='subs_count',
            field=models.PositiveBigIntegerField(default=0, verbose_name='Количество подписчиков'),
        ),
    ]
