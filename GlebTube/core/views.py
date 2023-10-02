from django.shortcuts import render,redirect

from django.views import View

from video_manager import models

def home(request):
    videos = models.Video.objects.all()
    context = {'videos': videos}
    return render(request,'main.html',context=context)
def my_videos(request):
   if request.user.is_authenticated:
        videos = models.Video.objects.all().filter(author=request.user)
        context = {'videos': videos}
        return render(request,'main.html',context=context)
   else: return redirect('/')