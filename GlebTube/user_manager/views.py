from django.shortcuts import render,redirect,HttpResponse

from django import views

from . import forms
from . import models
from video_manager.models import Video,RateVideo

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User

from django.middleware import csrf

from django.http import Http404

from django.shortcuts import get_object_or_404

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
               login(request,user,backend='django.contrib.auth.backends.ModelBackend')

               return redirect('/')
            else: return render(request, 'reg.html',context={'form':forms.AuthForm(),'alert':{'description':f'{form.errors}'}})
 
class Logout(views.View):
    def get(self,request):
        logout(request)
        return redirect('/')
  
# Shows user profile with additional info
class Profile(views.View):
    def get(self,request,user):
        try:
            user = get_object_or_404(User,id=user)
            isOwner = False
            if request.user == user: isOwner = True

            likes_count = RateVideo.objects.all().filter(grade=1,content__in = Video.objects.filter(author=user)).count()
            subs_count = models.Subscription.objects.all().filter(author = user).count()

            context = {'user': user,'isOwner':isOwner,'likes_count':likes_count,'subs_count':subs_count}
            return render(request,'profile.html',context=context)
        except User.DoesNotExist: 
            raise Http404("The requested resource was not found.")


# Uses the methods of the underlying model to output the video queue
class UserVideos(views.View):
    # Returns query of user videos    
    def get(self,request,user):
            queryset = Video.objects.filter(author__id = user)
            return render(request,'video_list.html', context={'videos': queryset})
# Same as UserVideos   
class UserLiked(views.View):
    # Returns query of user liked videos    
    def get(self,request,user):
            user = get_object_or_404(User,id=user)
            queryset = RateVideo.objects.all().filter(grade=1,author=user).select_related('content')
            queryset = [q.content for q in queryset]
            return render(request,'video_list.html',context={'videos': queryset})


class Subscribe(views.View):
    def get(self,request,user):
        user = get_object_or_404(User,id=user)
        if request.user.is_authenticated:
            subscription,created = models.Subscription.objects.get_or_create(subscriber = request.user,author=user)
            context = {'user' : user}
            if subscription.active:
                return render(request,'sub_buttons/unsub.html',context=context)
            else: 
                return render(request,'sub_buttons/sub.html',context=context)
        return HttpResponse("",status=401)
    def put(self,request,user):
        user = get_object_or_404(User,id=user)
        subscription,created = models.Subscription.objects.get_or_create(subscriber = request.user,author=user)
        if not created:
            subscription.active = not subscription.active
            subscription.save()
        return self.get(request,user.id)


# Clean's request user history
def delete_history(request):
    if request.user.is_authenticated:
        models.History.objects.all().filter(viewer=request.user).delete()
        return render(request,'alerts/success.html',context={'desc': 'История очищена'})
    else: HttpResponse("")