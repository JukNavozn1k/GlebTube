from django.shortcuts import render,redirect,HttpResponse

from django import views

from . import forms
from . import models
from . import tasks

from video_manager.models import Video,UserVideoRelation

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User

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
        user = get_object_or_404(User,id=user)
        context = {'user': user}
        return render(request,'profile/profile.html',context=context)
class ProfileMenu(views.View):
    def get(self,request,user):
        user = get_object_or_404(User,id=user)
        isOwner = request.user == user
        
        stars_count = UserVideoRelation.objects.all().filter(grade=1,video__in = Video.objects.filter(author__id=user.id)).count()
        subscribers_count = models.Subscription.objects.all().filter(author__id = user.id,active=True).count()

        context = {'isOwner':isOwner,'stars_count':stars_count,'subscribers_count':subscribers_count,'user':user}
        return render(request,'profile/profile_menu.html',context=context)

class ProfileEdit(views.View):
    def get(self,request):
        instance,created = models.UserAdditional.objects.get_or_create(user=request.user)
        form = forms.UserAdditionalForm(instance=instance)
        return render(request,'gt_form.html',context={'form':form,'title': 'Редактировать профиль'})
    def post(self,request):
        if not request.user.is_authenticated: return HttpResponse("",status=401)
        instance,created = models.UserAdditional.objects.get_or_create(user=request.user)
        form = forms.UserAdditionalForm(request.POST,request.FILES,instance=instance)
        if form.is_valid():
            form.save()
            return render(request,'gt_form.html',context={'form':forms.UserAdditionalForm(instance=instance),'success_alert':{'description':f'Профиль успешно отредактирован.','title':'Редактировать профиль'}})
        else: return render(request,'gt_form.html',context={'form':forms.UserAdditionalForm(instance=instance),'error_alert':{'description':f'{form.errors}','title':'Редактировать профиль'}})

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
            queryset = UserVideoRelation.objects.all().filter(grade=1,user__id=user).select_related('video')
            queryset = [q.video for q in queryset]
            return render(request,'video_list.html',context={'videos': queryset})


class Subscribe(views.View):
    def get_response_data(self,request,context,active):
        if active:
            return render(request,'sub_buttons/unsub.html',context=context)
        return render(request,'sub_buttons/sub.html',context=context)

    def get(self,request,user):
        user = get_object_or_404(User,id=user)
        if request.user.is_authenticated:
            subscription,created = models.Subscription.objects.get_or_create(subscriber = request.user,author=user)
            context = {'user' : user}
            return self.get_response_data(request,context,subscription.active)
        return HttpResponse("",status=401)
    def put(self,request,user):
        if request.user.is_authenticated:
            user = get_object_or_404(User,id=user)
            subscription,created = models.Subscription.objects.get_or_create(subscriber = request.user,author=user)
            tasks.update_subscription.delay(request.user.id,user.id)
            return self.get_response_data(request,{'user':user},not subscription.active)
        return HttpResponse("",status=401)


class History(views.View):
      # return's all watched wideo in -watched order
      def get(self,request):
          if request.user.is_authenticated:
            videos = models.WatchHistory.objects.filter(viewer__id=request.user.id).select_related('video').order_by('-id')
            videos = [v.video for v in videos]
            context = {'videos':videos,'title':'История'}
            return render(request,'main.html',context=context)
          else: return redirect('/login')
      def delete(self,request):
          if request.user.is_authenticated:
            tasks.clear_history.delay(request.user.id)
            return render(request,'alerts/success.html',context={'desc': 'История очищена'})
          else: return render(request,'alerts/error.html',context={'desc': 'История не очищена'})

def my_videos(request):
        if not request.user.is_authenticated: return redirect('/login')
        videos = models.Video.objects.filter(author=request.user)
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)

def rm_video_modal(request,video_id):
    return render(request,'modals/rm_video_modal_confirm.html',context={'video_id':video_id})