from django.shortcuts import render,HttpResponse

from django import views

from . import forms

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User


'''
Auth page
Navigation bar
Auth form
'''
class Login(views.View):
    def get(self,request):
        form = forms.AuthForm()
        context = {'form' : form, 'title' :'Авторизация'}
        return render(request, 'auth.html',context=context)
    def post(self,request):
        form = forms.AuthForm(request.POST)
        if authenticate(request,username=form['username'].value(),password=form['password'].value()) is None:
            return HttpResponse('Bad')
        return HttpResponse('Good')

class Reg(views.View):
    def get(self,request):
        form = forms.AuthForm()
        context = {'form' : form, 'title':'Регистрация'}
        return render(request, 'auth.html',context=context)

    def post(self,request):
        if User.objects.filter(username=request.POST['username']).first():
            return HttpResponse('User already exists!')
        else:
            form = forms.AuthForm(request.POST)
            if form.is_valid():
               user = form.save() 
               user.set_password(user.password)
               user.save()
            return HttpResponse('User created!')

