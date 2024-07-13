from django.shortcuts import render,redirect,HttpResponse

from django.views import View

from django.shortcuts import get_object_or_404

from . import models,forms
from user_manager.models import History as hist
from .models import Video

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

class VideoView(View):
    def get(self,request,video_id):
        video = get_object_or_404(Video,id=video_id)
        # PUT YOUR CELERY HERE
        video.views += 1
        video.save()
        # PUT YOUR CELERY HERE
        comments = models.CommentVideo.objects.all().filter(instance=video).order_by('-id').prefetch_related('author')
        context = {'video':video,'comments': comments} 
        return render(request,'watch.html',context=context)
    def delete(self,request,video_id):
        if request.user.is_authenticated :
                video = get_object_or_404(Video,author=request.user,id=video_id)
                video.delete()
                return HttpResponse("",status=200)
        else: return HttpResponse("",status=403)
def my_videos(request):
        videos = models.Video.objects.filter().select_related('author')
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)

class CommentVideo(View):
    # processing all actions with video
    def post(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video,id=video_id)
            comment = request.POST.get('comment')
            new_comment = models.CommentVideo(author=request.user,instance=video,content=comment)
            new_comment.save()
            return render(request,'comment.html',context={'comment':new_comment})
        return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
    def delete(self,request,comment_id):
            comment = get_object_or_404(models.CommentVideo,id=comment_id)
            if comment.author == request.user: 
                comment.delete()
                return HttpResponse("")
            return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
           



class RateVideoView(View):
    def get(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            rate_video, created = models.RateVideo.objects.get_or_create(content=video, author=user)
            context = {'video': video}
            if rate_video.grade == True: 
                return render(request,'rate_video/unrate_btn.html',context=context)
            else: return render(request,'rate_video/rate_btn.html',context=context)
        return HttpResponse("", status=401)
    # processing all actions with video
    def put(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video,id=video_id)
            user = request.user
            rate_video, created = models.RateVideo.objects.get_or_create(content=video, author=user)
            if not created:
                rate_video.grade = not rate_video.grade
                rate_video.save()
        return self.get(request,video_id) 
   