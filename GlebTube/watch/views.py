import os 

from django.shortcuts import render,redirect
from django.http import FileResponse, HttpResponse

from django.views import View

from django.shortcuts import get_object_or_404

from videos import models

from . import tasks


from django.db.models import Case,When,Q

from django.urls import reverse

class DownloadVideo(View):
    def get(self,request,video_id):
        video = get_object_or_404(models.Video, id=video_id)
        file_path = video.video.path
        file_name = os.path.basename(video.video.name)  # Get the file name directly
        if os.path.exists(file_path):
            return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_name)
        else:
            return HttpResponse("File does not exist",status=404)

class VideoView(View):
    def get(self,request,video_id):
        video = get_object_or_404(models.Video,id=video_id)
        if request.user.is_authenticated: 
            tasks.refresh_history.delay(video.id,request.user.id)
            
        hls_playlist_url = reverse('serve_hls_playlist', args=[video.id])
        context = {'video':video,'hls_url': hls_playlist_url} 
        tasks.refresh_views.delay(video_id)
        return render(request,'watch.html',context=context)
    

class CommentVideo(View):
    def get(self,request,video_id):
        comments = models.CommentVideo.objects.all().filter(instance__id=video_id).order_by('-id').select_related('author')
        if request.user.is_authenticated:
            comments = comments.annotate(
            user_rated=Case(When(Q(comment_rates__grade = 1,comment_rates__user = request.user),then=True),default=False))
        context = {'comments':comments}
        return render(request,'comments/comment_list.html',context=context)
        
            
    def post(self,request,video_id):
        comment = request.POST.get('comment')
        if request.user.is_authenticated and len(comment) > 0:
            
            new_comment = models.CommentVideo(author=request.user,instance_id=video_id,content=comment)
            new_comment.save()
            return render(request,'comments/comment.html',context={'comment':new_comment})
        return render(request,'alerts/error.html',context={'desc' : 'Невозможно добавить комментарий'})
    def delete(self,request,comment_id):
                if not request.user.is_authenticated: return render(request,'alerts/error.html',context={'desc' : 'Невозможно удалить комментарий'})
                tasks.remove_comment.delay(comment_id,request.user.id)
                return HttpResponse("")
           

class RateVideoView(View):
    def get_response_data(self,request,context,grade):
        if grade == True: 
                return render(request,'rate_video/unrate_btn.html',context=context)
        else: return render(request,'rate_video/rate_btn.html',context=context)

    def get(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(models.Video, id=video_id)
            user = request.user
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
            context = {'video': video}
            return self.get_response_data(request,context,rate_video.grade)
        return HttpResponse("", status=401)
    # processing all actions with video
    def put(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(models.Video,id=video_id)
            user = request.user
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
            tasks.update_video_rate.delay(video_id,user.id)
            return self.get_response_data(request,{'video':video},not rate_video.grade)
        return HttpResponse("", status=401)
   