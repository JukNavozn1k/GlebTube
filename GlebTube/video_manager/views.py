from django.shortcuts import render,redirect,HttpResponse
from django.http import JsonResponse

from django.views import View
from django.contrib.auth.models import User

from django.db.models import Q

from . import models,forms
from django.utils import timezone

import json 


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
        else: return render(request,'upload.html',context={'form':forms.UploadForm(),'alert':{'description':f'{form.errors}'}})


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

        comments = models.CommentVideo.objects.all().filter(instance=video)
        context = {'video':video,'likes':likes,'dislikes':dislikes,'grade':grade,'comments':comments} 
        return render(request,'watch.html',context=context)

    # processing all actions with video
    def post(self,request,video_id,action):
        if request.user.is_authenticated:
          video = models.Video.objects.all().filter(id=video_id).first()
          author = request.user
          rate_actions = {'dislike':-1,'unrate' : 0,'like':1} 

          if action == "comment":
                comment = json.loads(request.body)['comment']
                new_comment = models.CommentVideo(author=author,instance=video,content=comment)
                # new_comment.save()
                response = {'comment':comment,'author':str(request.user)}
                return JsonResponse(response, status=200)
            
          elif action in rate_actions:
                rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=author)).first()
                if rate is None:
                    rate = models.RateVideo()
                    rate.content = video
                    rate.author = author
                rate.grade = rate_actions[action]
                rate.save()
                return HttpResponse("Good!",status=200)
          
        return HttpResponse("Unauthorized: You need to log in", status=401)
        
    
