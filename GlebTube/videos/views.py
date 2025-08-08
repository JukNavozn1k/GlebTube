from django.shortcuts import render,redirect,HttpResponse
from django.urls import reverse
from django.views import View

from . import forms
from .models import Video

from django.shortcuts import get_object_or_404

from django.http import JsonResponse
from django.shortcuts import redirect

from . import tasks

import torch
from .models import Video
from .semantic_search import encode_titles  
import torch.nn.functional as F

def search_videos(request):
    query = request.GET.get('search_query', '').strip()
    if not query:
        videos = Video.objects.none()
        context = {'videos': videos}
        return render(request, 'main.html', context=context)
    
    # Получаем все видео, у которых есть эмбеддинг
    videos_qs = Video.objects.exclude(search_embedding__isnull=True).order_by('-stars_count', '-id')
    
    # Загружаем эмбеддинги из JSONField и преобразуем в тензор
    embeddings_list = []
    videos_list = []
    for video in videos_qs:
        if video.search_embedding:
            embeddings_list.append(torch.tensor(video.search_embedding))
            videos_list.append(video)
    
    if not embeddings_list:
        # Эмбеддинги не найдены — возвращаем пустой результат
        return render(request, 'main.html', context={'videos': []})
    
    title_embeddings = torch.stack(embeddings_list)  # [N, D]
    
    # Вычисляем эмбеддинг запроса (одно значение)
    query_emb = encode_titles([query])  # [1, D]
    
    # Нормализуем эмбеддинги
    title_embeddings = F.normalize(title_embeddings, p=2, dim=1)
    query_emb = F.normalize(query_emb, p=2, dim=1)
    
    # Косинусное расстояние
    cos_sim = torch.matmul(title_embeddings, query_emb.T).squeeze(1)
    cos_dist = 1 - cos_sim
    
    k = 10
    if k > len(cos_dist):
        k = len(cos_dist)
    topk_dist, topk_idx = torch.topk(cos_dist, k, largest=False)
    
    # Получаем видео в порядке похожести
    results = [videos_list[idx] for idx in topk_idx]
    
    context = {'videos': results}
    return render(request, 'main.html', context=context)

def search_my_videos(request):
    if not request.user.is_authenticated: return redirect(reverse('signIn'))
    videos = Video.objects.filter(caption__icontains=request.GET['search_query'],author=request.user).order_by('-stars_count','-id')
    context={'videos':videos,'author_buttons':True}
    return render(request,'main.html',context=context)

def my_videos(request):
    if not request.user.is_authenticated: return redirect(reverse('signIn'))
    videos = Video.objects.filter(author_id=request.user.id)
    context = {'author_buttons':True,'title':'Мои видео','videos': videos}
    return render(request,'main.html',context=context)

def delete_video(request,video_id):
    if request.user.is_authenticated :
            tasks.remove_video.delay(video_id,request.user.id)
            response = JsonResponse({'success': True})
            response['HX-Redirect'] = '/'  # Redirect to the homepage
            return response
    else: return HttpResponse("",status=401)


class UploadVideo(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect(reverse('signIn'))
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
       return render(request,'edit_video.html',context={'form':form,'title':'Редактировать видео','video_id':video_id})
     
    def post(self,request,video_id):
        if not request.user.is_authenticated: return HttpResponse("",status=401)
        video = get_object_or_404(Video,author=request.user,id=video_id)
        form = forms.EditForm(request.POST,request.FILES,instance=video)
        if form.is_valid():
            form.save()
            return render(request,'edit_video.html',context={'form':forms.EditForm(instance=video),'success_alert':{'description':f'Видео успешно отредактировано.','title':'Редактировать видео'},'video_id':video_id})
        else: return render(request,'edit_video.html',context={'form':forms.EditForm(instance=video),'error_alert':{'description':f'{form.errors}','title':'Редактировать видео'},'video_id':video_id})
