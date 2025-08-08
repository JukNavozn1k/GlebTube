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
from .semantic_search import semantic_search_knn  # предполагаем, что есть

def search_videos(request):
    query = request.GET.get('search_query', '').strip()
    if not query:
        videos = Video.objects.none()
        context = {'videos': videos}
        return render(request, 'main.html', context=context)
    
    # Получаем все видео (можно оптимизировать подгрузку только заголовков)
    videos_qs = Video.objects.all().order_by('-stars_count', '-id')
    
    # Собираем заголовки и индексируем
    titles = list(videos_qs.values_list('caption', flat=True))  # или 'title', если поле так называется
    
    # Преобразуем в dataset-подобную структуру для semantic_search_knn
    class SimpleDataset:
        def __init__(self, titles):
            self.titles = titles
        def __len__(self):
            return len(self.titles)
        def __getitem__(self, idx):
            return {'title': self.titles[idx]}
    dataset = SimpleDataset(titles)
    
    # Ищем топ-K (например 10)
    top_results = semantic_search_knn(dataset, query, k=10)
    
    # Получаем индексы из результата
    top_indices = [idx for idx, dist in top_results]
    
    # Список видео по найденным индексам
    # Чтобы сохранить порядок, получим видео в порядке индексов:
    videos = [videos_qs[i] for i in top_indices if i < len(videos_qs)]
    
    context = {'videos': videos}
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
