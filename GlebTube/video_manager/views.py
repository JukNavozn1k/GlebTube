from django.shortcuts import render,redirect,HttpResponse

from django.views import View

from django.shortcuts import get_object_or_404

from . import models,forms
from .models import Video

from . import tasks



class UploadVideo(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'gt_form.html',context={'form':forms.UploadForm(),'title':'Новое видео'})
    def post(self,request):
        if not request.user.is_authenticated: return HttpResponse("",status=401)

        form = forms.UploadForm(request.POST,request.FILES)
      
        if form.is_valid():
            video  = form.save()
            video.author = request.user
            video.save()
            return render(request,'gt_form.html',context={'form':forms.UploadForm(),'success_alert':{'description':f'Видео успешно загружено.','title':'Новое видео'}})
        else: return render(request,'gt_form.html',context={'form':forms.UploadForm(),'error_alert':{'description':f'{form.errors}','title':'Новое видео'}})

class EditVideo(View):
    def get(self,request,video_id):
       if not request.user.is_authenticated: return HttpResponse("",status=401)
       video = get_object_or_404(Video,author=request.user,id=video_id)
       form = forms.EditForm(instance=video)
       return render(request,'gt_form.html',context={'form':form,'title':'Редактировать видео'})
     
    def post(self,request,video_id):
        if not request.user.is_authenticated: return HttpResponse("",status=401)
        video = get_object_or_404(Video,author=request.user,id=video_id)
        form = forms.EditForm(request.POST,request.FILES,instance=video)
        if form.is_valid():
            form.save()
            return render(request,'gt_form.html',context={'form':forms.EditForm(instance=video),'success_alert':{'description':f'Видео успешно отредактировано.','title':'Редактировать видео'}})
        else: return render(request,'gt_form.html',context={'form':forms.EditForm(instance=video),'error_alert':{'description':f'{form.errors}','title':'Редактировать видео'}})

class VideoView(View):
    def get(self,request,video_id):
        video = get_object_or_404(Video,id=video_id)
        if request.user.is_authenticated: 
            tasks.refresh_history.delay(video.id,request.user.id)
        context = {'video':video} 
        tasks.refresh_views.delay(video_id)
        return render(request,'watch.html',context=context)
    def delete(self,request,video_id):
        if request.user.is_authenticated :
                video = get_object_or_404(Video,author=request.user,id=video_id)
                video.delete()
                return HttpResponse("",status=200)
        else: return HttpResponse("",status=403)

class CommentVideo(View):
    def get(self,request,video_id):
        comments = models.CommentVideo.objects.all().filter(instance__id=video_id).order_by('-id').prefetch_related('author').select_related('author__additional')
        context = {'comments':comments}
        return render(request,'comment_list.html',context=context)
    def post(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video,id=video_id)
            comment = request.POST.get('comment')
            new_comment = models.CommentVideo(author=request.user,instance=video,content=comment)
            new_comment.save()
            return render(request,'comment.html',context={'comment':new_comment})
        return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
    def delete(self,request,comment_id):
                if not request.user.is_authenticated: return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
                tasks.remove_comment.delay(comment_id,request.user.id)
                return HttpResponse("")
           

class RateVideoView(View):
    def get(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
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
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
            if not created:
                rate_video.grade = not rate_video.grade
                rate_video.save()
                tasks.refresh_rates.delay(video.id)
        return self.get(request,video_id) 
   