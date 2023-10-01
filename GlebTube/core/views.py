from django.shortcuts import render

from django.views import View

from video_manager import models

def home(request):
    videos = models.Video.objects.all()
    context = {'videos': videos}
    print(context)
    return render(request,'main.html',context=context)
