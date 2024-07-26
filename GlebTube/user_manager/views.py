from django.shortcuts import render,redirect,HttpResponse

from django import views


from . import models


from video_manager.models import Video,UserVideoRelation


from django.contrib.auth.models import User

from django.shortcuts import get_object_or_404

def my_videos(request):
        if not request.user.is_authenticated: return redirect('/login')
        videos = models.Video.objects.filter(author=request.user)
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)

def rm_video_modal(request,video_id):
    return render(request,'modals/rm_video_modal_confirm.html',context={'video_id':video_id})