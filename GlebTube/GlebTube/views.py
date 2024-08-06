import os
from django.http import FileResponse
from django.shortcuts import render
from videos import models


from django.shortcuts import render,redirect,HttpResponse

from django.urls import reverse

from django.shortcuts import get_object_or_404

from django.core.cache import cache
from . import settings

def serve_hls_playlist(request, video_id):
    try:
        video = get_object_or_404(models.Video, pk=video_id)
           
        hls_playlist_path = video.hls

        with open(hls_playlist_path, 'r') as m3u8_file:
            m3u8_content = m3u8_file.read()

        base_url = request.build_absolute_uri('/') 
        serve_hls_segment_url = base_url +"serve_hls_segment/" +str(video_id)
        m3u8_content = m3u8_content.replace('{{ dynamic_path }}', serve_hls_segment_url)


        return HttpResponse(m3u8_content, content_type='application/vnd.apple.mpegurl')
    except (models.Video.DoesNotExist, FileNotFoundError):
        return HttpResponse("Video or HLS playlist not found", status=404)

def serve_hls_segment(request, video_id, segment_name):
    try:
        KEY = settings.CACHE_HLS_PATH(video_id)
        CACHE = cache.get(KEY)
        if CACHE:
            hls_directory = CACHE
        else:
            video = get_object_or_404(models.Video, pk=video_id)
            hls_directory = os.path.join(os.path.dirname(video.video.path), 'hls_output')
            cache.set(KEY,hls_directory,timeout=settings.CACHE_HLS_TIMEOUT)
        segment_path = os.path.join(hls_directory, segment_name)

        # Serve the HLS segment as a binary file response
        return FileResponse(open(segment_path, 'rb'))
    except (models.Video.DoesNotExist, FileNotFoundError):
        return HttpResponse("Video or HLS segment not found", status=404)

def home(request):
  videos = models.Video.objects.all().order_by('-stars_count','-id')
  print(request.GET) 
  context= {'title' : 'Главная','videos':videos}
  return render(request,'main.html',context=context)

