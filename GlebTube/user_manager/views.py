from django.shortcuts import render,redirect

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
        if request.user.is_authenticated: return redirect('/')
        return render(request, 'login.html',context={'form':forms.AuthForm()})
    def post(self,request):
        if request.user.is_authenticated: return redirect('/')
        form = forms.AuthForm(request.POST)
        user = authenticate(request,username=form['username'].value(),password=form['password'].value())
        if user  is None:
            return render(request, 'login.html',context={'form':forms.AuthForm(),'alert':{'description':'Неверная комбинация логина и пароля.'}})
        else: 
            # login user...
            login(request,user)
            return redirect('/')

class Reg(views.View):
    def get(self,request):
        if request.user.is_authenticated: return redirect('/')
        return render(request, 'reg.html',context={'form':forms.AuthForm()})

    def post(self,request):
        if request.user.is_authenticated: return redirect('/')
        if User.objects.filter(username=request.POST['username']).first():
            return render(request, 'reg.html',context={'form':forms.AuthForm(),'alert':{'description':'Пользователь уже существует.'}})
        else:
            form = forms.AuthForm(request.POST)
            if form.is_valid():
               user = form.save() 
               user.set_password(user.password)
               user.save()
               login(request,user)
               return redirect('/')
            else: return render(request, 'reg.html',context={'form':forms.AuthForm(),'alert':{'description':f'{form.errors}'}})

class Logout(views.View):
    def get(self,request):
        logout(request)
        return redirect('/')
  

