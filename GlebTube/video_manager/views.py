from django.shortcuts import render,redirect,HttpResponse

from django.views import View
from django.contrib.auth.models import User

from django.shortcuts import get_object_or_404

from django.db.models import Q
from . import models,forms
from user_manager.models import History as hist
from .models import Video


import bleach
from django.utils.safestring import mark_safe
from markdownx.utils import markdownify

class History(View):
      # return's all watched wideo in -watched order
      def get(self,request):
          if request.user.is_authenticated:
            history = hist.objects.filter(viewer=request.user).order_by('-id').select_related('video__author')
            videos = [h.video for h in history]
            context = {'videos':videos,'title':'История'}
            return render(request,'main.html',context=context)
          else: return redirect('/login')
      def delete(self,request):
          if request.user.is_authenticated:
            hist.objects.all().filter(viewer=request.user).delete() 
            return render(request,'main.html')
          else: return redirect('/login')


class UploadVideo(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'upload.html',context={'form':forms.UploadForm(),'title':'Новое видео'})
    def post(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')

        form = forms.UploadForm(request.POST,request.FILES)
      
        if form.is_valid():
            video  = form.save()
            video.author = request.user
            video.save()
            return render(request,'upload.html',context={'form':forms.UploadForm(),'success_alert':{'description':f'Видео успешно загружено.','title':'Новое видео'}})
        else: return render(request,'upload.html',context={'form':forms.UploadForm(),'error_alert':{'description':f'{form.errors}','title':'Новое видео'}})



class EditVideo(View):
    def get(self,request,video_id):
       video = get_object_or_404(Video,author=request.user,id=video_id)
       form = forms.EditForm(instance=video)
       return render(request,'edit.html',context={'form':form})
     
    def post(self,request,video_id):
        video = get_object_or_404(Video,author=request.user,id=video_id)
        form = forms.EditForm(request.POST,request.FILES,instance=video)
        if form.is_valid():
            form.save()
            return render(request,'edit.html',context={'form':forms.EditForm(instance=video),'success_alert':{'description':f'Видео успешно отредактировано.','title':'Редактировать видео'}})
        else: return render(request,'edit.html',context={'form':forms.EditForm(instance=video),'error_alert':{'description':f'{form.errors}','title':'Редактировать видео'}})

class Watch(View):
    def get(self,request,video_id):
        video = models.Video.objects.all().filter(id=video_id).first()
        
        video.views += 1
        video.save()

        # rates = models.RateVideo.objects.all().filter(content=video)
        # likes = rates.filter(grade=1).count()
            
        comments = models.CommentVideo.objects.all().filter(instance=video).order_by('-id').select_related('author')
        context = {'video':video} 
        return render(request,'watch.html',context=context)

    # processing all actions with video
    def post(self,request,obj_id,action):
        if request.user.is_authenticated:
          video = models.Video.objects.all().filter(id=obj_id).first()
          author = request.user
          rate_actions = {'dislike':-1,'unrate' : 0,'like':1} 

          if action == "comment":
                comment = request.POST.get('comment')
                new_comment = models.CommentVideo(author=author,instance=video,content=comment)
                new_comment.save()
                return render(request,'comment.html',context={'comment':new_comment})
          elif action in rate_actions:
                rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=author)).first()
                if rate is None:
                    rate = models.RateVideo()
                    rate.content = video
                    rate.author = author
                rate.grade = rate_actions[action]
                rate.save()
                return HttpResponse("Good!",status=200)
          
        return render(request, 'alerts/error.html',context={'desc' : 'Невозможно добавить комментарий'})
    def delete(self,request,obj_id,action):
        print(obj_id)
        if action == "rm_comment":
            comment = get_object_or_404(models.CommentVideo,id=obj_id)
            if comment.author == request.user: 
                comment.delete()
                return HttpResponse("")
            return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
        return render(request,'alerts/error.html',context={'desc' : 'Мы пытаемся её исправить =('})
def my_videos(request):
        videos = models.Video.objects.filter().select_related('author')
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)



def delete_video(request,video_id):
   if request.user.is_authenticated :
        video = models.Video.objects.filter(id=video_id, author=request.user).first()
        if video is None: return HttpResponse("",status=403)
        else: video.delete()
        return HttpResponse("",status=200)
   else: return HttpResponse("",status=403)