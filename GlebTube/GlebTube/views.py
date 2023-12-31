from django.shortcuts import render
from video_manager import models

def home(request):
    videos = models.Video.objects.all()
    context = {'videos': videos, 'title':'Главная'}
    return render(request,'main.html',context=context)


def handler404(request, *args, **argv):
  return render(request,'base_error.html',context={'error_code':'404'})

def handler500(request, *args, **argv):
  return render(request,'base_error.html',context={'error_code':'500'})