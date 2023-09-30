from django.shortcuts import render,HttpResponse
from django.views import View

from . import forms

class Upload(View):
    def get(self,request):
        form = forms.UploadForm()
        context = {'form' : form}
        return render(request,'upload.html',context=context)