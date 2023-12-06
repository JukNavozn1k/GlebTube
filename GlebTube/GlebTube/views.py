from django.shortcuts import render,redirect

from django.views import View

from video_manager import models

def home(request):
    videos = models.Video.objects.all()
    context = {'videos': videos}
    return render(request,'main.html',context=context)


def handler404(request, *args, **argv):
  return render(request,'404.html')