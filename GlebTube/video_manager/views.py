from django.shortcuts import render,redirect,HttpResponse
from django.views import View
from django.contrib.auth.models import User


from . import models
from . import forms

class Upload(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'upload.html',context={'form':forms.UploadForm()})
    def post(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')

        form = forms.UploadForm(request.POST,request.FILES)
        form.author = User.objects.get(username=request.user)
        print(form.author)
        if form.is_valid():
            form.save()
            return redirect('/')
        else: return render(request,'upload.html',context={'form':forms.UploadForm()})


class Watch(View):
    def get(self,request,video_id):
        video = models.Video.objects.get(video_id=int(video_id))

        context = {'video':video}
        return render(request,'watch.html',context=context)