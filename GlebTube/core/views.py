from django.shortcuts import render

from django.views import View


def home(request):
    return render(request,'main.html')
