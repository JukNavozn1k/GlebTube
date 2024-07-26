from django.shortcuts import render
from videos import models


def home(request):
  videos = models.Video.objects.all()
  context = {'videos': videos, 'title':'Главная'}
  return render(request,'main.html',context=context)

