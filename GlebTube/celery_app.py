import os

from celery import Celery
from celery.schedules import crontab
os.environ.setdefault('DJANGO_SETTINGS_MODULE','GlebTube.settings')

app = Celery('GlebTube')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()
# app.conf.beat_schedule = {
#     'update-user-embeddings': {
#         'task': 'videos.tasks.update_users_embeddings',
#         'schedule': 60.0,  # каждую минуту
#     },
# }