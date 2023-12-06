from django.shortcuts import render,redirect,HttpResponse
from django.http import JsonResponse

from django.views import View
from django.contrib.auth.models import User

from django.db.models import Q
from . import models,forms
from user_manager.models import History as hist

import json 

import bleach
from django.utils.safestring import mark_safe
from markdownx.utils import markdownify

class History(View):
      # return's all watched wideo in -watched order
      def get(self,request):
          if request.user.is_authenticated:
            history = hist.objects.all().filter(viewer=request.user)
            videos = [h.video for h in history][::-1]
            context = {'videos':videos,'title':'История'}
            return render(request,'main.html',context=context)
          else: return redirect('/')
      def delete(self,request):
          if request.user.is_authenticated:
            hist.objects.all().filter(viewer=request.user).delete() 
            return render(request,'main.html')
          else: return redirect('/')


class UploadVideo(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'upload.html',context={'form':forms.UploadForm(),'title':'Новое видео'})
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
        else: return render(request,'upload.html',context={'form':forms.UploadForm(),'alert':{'description':f'{form.errors}','title':'Новое видео'}})


'''
class EditVideo(View):
    def get(self,request,video_id):
       return HttpResponse(f"Video id: {video_id}")
    def delete(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        else: return redirect('/login')

        form = forms.UploadForm(request.POST,request.FILES)
        form.author = User.objects.get(username=request.user)
        if form.is_valid():
            video  = form.save()
            video.author = request.user
            video.save()
            return redirect('/')
        else: return render(request,'upload.html',context={'form':forms.UploadForm(),'alert':{'description':f'{form.errors}','title':'Новое видео'}})
'''




class Watch(View):

    def get(self,request,video_id):
        video = models.Video.objects.all().filter(id=video_id).first()
        
        video.views += 1
        video.save()

        rates = models.RateVideo.objects.all().filter(content=video)
        likes = rates.filter(grade=1).count()
        dislikes = rates.filter(grade=-1).count()
            
        if request.user.is_authenticated: 
            rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=request.user)).first()
            hist(viewer=request.user,video=video).save()
        else: rate = None
        grade = 0
        if not rate is None:
            grade = rate.grade

        comments = models.CommentVideo.objects.all().filter(instance=video).order_by('-id')
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
                cleaned_comment = bleach.clean(comment,tags=bleach.ALLOWED_TAGS, attributes=bleach.ALLOWED_ATTRIBUTES)
                new_comment.save()
                response = {'comment': mark_safe(markdownify(cleaned_comment)),'author':str(request.user)}
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
        
    
def my_videos(request):
   if request.user.is_authenticated:
        videos = models.Video.objects.all().filter(author=request.user)
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)
   else: return redirect('/')


def delete_video(request,video_id):
   if request.user.is_authenticated :
        video = models.Video.objects.filter(id=video_id, author=request.user).first()
        if video is None: return HttpResponse("NOT OK",status=403)
        else: video.delete()
        return HttpResponse("OK",status=200)
   else: return HttpResponse("NOT OK",status=403)