from django.shortcuts import render,HttpResponse
from django.views import View

from . import forms

from . import forms

class Upload(View):
    def get(self,request):
        form = forms.UploadForm()
        context = {'form' : form}
        return render(request,'upload.html',context=context)
    def post(self,request):
        form = forms.UploadForm(request.POST,request.FILES)
        if form.is_valid():
            form.save()
            return HttpResponse('Uploading...')
        else: return HttpResponse('ERROR!')