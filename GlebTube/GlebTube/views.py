from django.shortcuts import render
from video_manager import models

from django.conf import settings
from django.core.cache import cache

def home(request):
    videos = cache.get(settings.CACHE_ALL_VIDEO_QUERYSET)
    if not videos:
       videos = models.Video.objects.all()
       cache.set(settings.CACHE_ALL_VIDEO_QUERYSET,videos,timeout=settings.CACHE_ALL_VIDEO_QUERYSET_TIMEOUT)
    
    context = {'videos': videos, 'title':'Главная'}
    return render(request,'main.html',context=context)


def handler404(request, *args, **argv):
  return render(request,'base_error.html',context={'error_code':'404'})

def handler500(request, *args, **argv):
  return render(request,'base_error.html',context={'error_code':'500'})