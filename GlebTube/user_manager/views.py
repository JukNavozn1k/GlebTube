from django.shortcuts import render,redirect,HttpResponse

from django import views

from . import forms
from . import models
from video_manager.models import Video,RateVideo

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User

from django.middleware import csrf

from django.http import Http404

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
            user = User.objects.get(username=user)
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
            queryset = Video.objects.filter(author__username = user)
            return render(request,'video_list.html', context={'videos': queryset})
# Same as UserVideos   
class UserLiked(views.View):
    # Returns query of user liked videos    
    def get(self,request,user):
            user = User.objects.get(username=user)
            queryset = RateVideo.objects.all().filter(grade=1,author=user).select_related('content')
            queryset = [q.content for q in queryset]
            return render(request,'video_list.html',context={'videos': queryset})


class Subscribe(views.View):
    '''
        Responsible for the logic of 
        subscribe/unsubscribe buttons in the profile
    '''
    def get(self,request,user):
        user = User.objects.get(username=user)
        is_subscribed = models.Subscription.objects.all().filter(subscriber = request.user,author=user).exists()
        response = ''
        if  is_subscribed:
            response += f'''
           <button type="button" 
              hx-put="/profile_action/{user.username}/subscribe" 
              hx-swap="outerHTML"
              hx-headers='{{"X-CSRFToken": "{csrf.get_token(request)}"}}'         
              class="btn btn-danger btn-sm">
                <i class="bi bi-dash-lg">  Отписаться</i>
              </button>
            '''
        else:
            response += f'''
           <button type="button" 
              hx-put="/profile_action/{user.username}/subscribe" 
              hx-swap="outerHTML"
              hx-headers='{{"X-CSRFToken": "{csrf.get_token(request)}"}}'         
              class="btn btn-outline-primary btn-sm">
                <i class="bi bi-plus-lg"> Подписаться</i>
              </button>
            '''
        return HttpResponse(response)
    def put(self,request,user):
        user = User.objects.get(username=user)
        is_subscribed = models.Subscription.objects.all().filter(subscriber = request.user,author=user).exists()
        if is_subscribed:
            models.Subscription.objects.get(subscriber = request.user,author=user).delete()
        else: models.Subscription(subscriber = request.user,author=user).save()
        return HttpResponse(self.get(request,user))


# Clean's request user history
def delete_history(request):
    if request.user.is_authenticated:
        models.History.objects.all().filter(viewer=request.user).delete()
        return render(request,'alerts/success.html',context={'desc': 'История очищена'})
    else: HttpResponse("")