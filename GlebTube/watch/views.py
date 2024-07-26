import os 

from django.shortcuts import render,redirect
from django.http import FileResponse, HttpResponse

from django.views import View

from django.shortcuts import get_object_or_404

from videos import models


from videos.models import Video

from . import tasks

from django.db.models import Prefetch
from django.contrib.auth.models import User

from django.urls import reverse


def serve_hls_playlist(request, video_id):
    try:
        video = get_object_or_404(Video, pk=video_id)
           
        hls_playlist_path = video.hls

        with open(hls_playlist_path, 'r') as m3u8_file:
            m3u8_content = m3u8_file.read()

        base_url = request.build_absolute_uri('/') 
        serve_hls_segment_url = base_url +"serve_hls_segment/" +str(video_id)
        m3u8_content = m3u8_content.replace('{{ dynamic_path }}', serve_hls_segment_url)


        return HttpResponse(m3u8_content, content_type='application/vnd.apple.mpegurl')
    except (Video.DoesNotExist, FileNotFoundError):
        return HttpResponse("Video or HLS playlist not found", status=404)

def serve_hls_segment(request, video_id, segment_name):
    try:
        video = get_object_or_404(Video, pk=video_id)
        hls_directory = os.path.join(os.path.dirname(video.video.path), 'hls_output')
        segment_path = os.path.join(hls_directory, segment_name)

        # Serve the HLS segment as a binary file response
        return FileResponse(open(segment_path, 'rb'))
    except (Video.DoesNotExist, FileNotFoundError):
        return HttpResponse("Video or HLS segment not found", status=404)



class VideoPlayer(View):
    def get(self,request,video_id):
        video = get_object_or_404(Video,id=video_id)
        if video.status == 'Completed':
            hls_playlist_url = reverse('serve_hls_playlist', args=[video.id])
            context = {'video':video,'hls_url': hls_playlist_url} 
            return render(request,'video/video_loaded.html',context=context)
        else: 
            context = {'video':video} 
            return render(request,'video/video_loading_delay.html',context=context)
            


class VideoView(View):
    def get(self,request,video_id):
        video = get_object_or_404(Video,id=video_id)
        if request.user.is_authenticated: 
            tasks.refresh_history.delay(video.id,request.user.id)

        context = {'video':video} 
        tasks.refresh_views.delay(video_id)
        return render(request,'watch.html',context=context)
    

class CommentVideo(View):
    def get(self,request,video_id):
        users_with_additional =  Prefetch('author',User.objects.all().select_related('additional'))
        comments = models.CommentVideo.objects.all().filter(instance__id=video_id).order_by('-id').prefetch_related(
           users_with_additional)
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
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
            context = {'video': video}
            return self.get_response_data(request,context,rate_video.grade)
        return HttpResponse("", status=401)
    # processing all actions with video
    def put(self,request,video_id):
        if request.user.is_authenticated:
            video = get_object_or_404(Video,id=video_id)
            user = request.user
            rate_video, created = models.UserVideoRelation.objects.get_or_create(video=video, user=user)
            tasks.update_video_rate.delay(video_id,user.id)
            return self.get_response_data(request,{'video':video},not rate_video.grade)
        return HttpResponse("", status=401)
   