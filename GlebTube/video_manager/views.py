from django.shortcuts import render,redirect
from django.views import View

from . import forms

from . import forms

class Upload(View):
    def get(self,request):
        return render(request,'upload.html',context={'form':forms.UploadForm()})
    def post(self,request):
        form = forms.UploadForm(request.POST,request.FILES)
        if form.is_valid():
            form.save()
            return redirect('/')
        else: return render(request,'upload.html',context={'form':forms.UploadForm()})