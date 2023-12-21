from django.shortcuts import render,redirect,HttpResponse

from django import views

from . import forms
from . import models

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User



# User auth
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
        
# User register
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
# 
class Logout(views.View):
    def get(self,request):
        logout(request)
        return redirect('/')
  
# Shows user profile with additional info
class Profile(views.View):
    def get(self,request,user):
        try:
            user = User.objects.get(username=user)
            
            isOwner = False
            if request.user == user: isOwner = True
            context = {'username': user.username,'isOwner':isOwner}
            return render(request,'profile.html',context=context)
        except User.DoesNotExist: 
            return render(request,'404.html')

# Returns query of user videos    
def user_videos(request,user):
    return HttpResponse('Куча улётной фигни')

# Returns query of user liked videos 
def user_liked(request,user):
    return HttpResponse('Ещё больше улётной фигни')


# Clean's request user history
def delete_history(request):
    if request.user.is_authenticated :
        models.History.objects.all().filter(viewer=request.user).delete()
        return HttpResponse("",status=200)
    else: return HttpResponse("",status=403)