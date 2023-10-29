from django.shortcuts import render,redirect,HttpResponse
from django.views import View
from django.contrib.auth.models import User

from django.db.models import Q

from . import models
from . import forms

class Upload(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'upload.html',context={'form':forms.UploadForm()})
    def post(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')

        form = forms.UploadForm(request.POST,request.FILES)
        form.author = User.objects.get(username=request.user)
        if form.is_valid():
            video  = form.save()
            video.author = request.user
            video.save()
            
            return redirect('/')
        else: return render(request,'upload.html',context={'form':forms.UploadForm()})


class Watch(View):
    def get(self,request,video_id):
        video = models.Video.objects.all().filter(id=video_id).first()
        video.views += 1
        video.save()

        rates = models.RateVideo.objects.all().filter(content=video)
        likes = rates.filter(grade=1).count()
        dislikes = rates.filter(grade=-1).count()

        if request.user.is_authenticated: rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=request.user)).first()
        else: rate = None
        grade = 0
        if not rate is None:
            grade = rate.grade
        context = {'video':video,'likes':likes,'dislikes':dislikes,'grade':grade}
        return render(request,'watch.html',context=context)
    


def video(request,video_id,action):
    if request.user.is_authenticated:
        video = models.Video.objects.all().filter(id=video_id).first()
        author = request.user

        rate = models.RateVideo.objects.filter(Q(video=video) & Q(author=author)).first()
        if rate is None:
            rate = models.RateVideo()
            rate.video = video
            rate.author = author

        if action == 'like':
            rate.grade = 1
        elif action == 'dislike':
            rate.grade = -1
        rate.save()

        return HttpResponse('200')
    return HttpResponse('User not logged!')
    