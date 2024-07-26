from django.shortcuts import render,redirect,HttpResponse
from django.urls import reverse
from django.views import View

from . import forms
from .models import Video,UserVideoRelation


from django.contrib.auth.models import User

from django.shortcuts import get_object_or_404





def my_videos(request):
        if not request.user.is_authenticated: return redirect(reverse('signIn'))
        videos = Video.objects.filter(author=request.user)
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)

def rm_video_modal(request,video_id):
    return render(request,'modals/rm_video_modal_confirm.html',context={'video_id':video_id})



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
       return render(request,'gt_form.html',context={'form':form,'title':'Редактировать видео'})
     
    def post(self,request,video_id):
        if not request.user.is_authenticated: return HttpResponse("",status=401)
        video = get_object_or_404(Video,author=request.user,id=video_id)
        form = forms.EditForm(request.POST,request.FILES,instance=video)
        if form.is_valid():
            form.save()
            return render(request,'gt_form.html',context={'form':forms.EditForm(instance=video),'success_alert':{'description':f'Видео успешно отредактировано.','title':'Редактировать видео'}})
        else: return render(request,'gt_form.html',context={'form':forms.EditForm(instance=video),'error_alert':{'description':f'{form.errors}','title':'Редактировать видео'}})
