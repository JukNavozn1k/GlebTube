import os
from django.http import FileResponse
from django.shortcuts import render
from videos import models


from django.shortcuts import render,redirect,HttpResponse

from django.urls import reverse

from django.shortcuts import get_object_or_404

from django.core.cache import cache
from . import settings

import numpy as np
from scipy.spatial.distance import cosine

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
    
    user = request.user
   
    if not user.is_authenticated:
        # Если нет эмбеддингов — просто отдаем топ видео по звёздам и id
        print('Default query!')
        videos = models.Video.objects.all().order_by('-stars_count', '-id')[:20]
        return render(request, 'main.html', {'title': 'Главная', 'videos': videos})

    # Получаем все видео отсортированные (можно в будущем добавить фильтрацию)
    all_videos = list(models.Video.objects.all())
    user_clusters = user.user_embeddings
    total_count = sum(c['count'] for c in user_clusters)

    # Чтобы не рекомендовать одинаковые видео
    recommended_video_ids = set()
    recommended_videos = []

    for cluster in user_clusters:
        mean_vector = np.array(cluster['mean_vector'])
        count = cluster['count']
        cluster_id = cluster['cluster_id']

        # Количество видео для рекомендаций из кластера
        cluster_video_count = int(count / total_count * 20)  # 20 — максимум рекомендаций всего, можно менять
        if cluster_video_count == 0:
            cluster_video_count = 1  # минимум 1 видео из каждого кластера

        # Фильтруем видео, которые еще не рекомендовали
        candidate_videos = [v for v in all_videos if v.id not in recommended_video_ids and v.video_embedding is not None]

        # Вычисляем косинусное расстояние до mean_vector
        distances = []
        for video in candidate_videos:
            emb = np.array(video.video_embedding)
            dist = cosine(mean_vector, emb)
            distances.append((dist, video))

        # Сортируем по возрастанию расстояния (чем меньше, тем похожее)
        distances.sort(key=lambda x: x[0])

        # Берём нужное количество похожих
        selected = [v for _, v in distances[:cluster_video_count]]

        # Добавляем в список рекомендаций
        recommended_videos.extend(selected)

        # Обновляем множество уже добавленных видео
        recommended_video_ids.update(v.id for v in selected)

    # Если мало видео набралось, добавим популярных сверху
    if len(recommended_videos) < 20:
        extra = models.Video.objects.exclude(id__in=recommended_video_ids).order_by('-stars_count', '-id')[:20 - len(recommended_videos)]
        recommended_videos.extend(extra)

    context = {
        'title': 'Главная',
        'videos': recommended_videos,
    }
    return render(request, 'main.html', context)