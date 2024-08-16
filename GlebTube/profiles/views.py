from django.shortcuts import render
from django.shortcuts import render,redirect,HttpResponse
from django import views
from django.urls import reverse

from . import forms
from . import models
from . import tasks

from videos.models import Video,UserVideoRelation
from auths.models import User



from django.shortcuts import get_object_or_404


# Shows user profile with additional info
class Profile(views.View):
    def get(self,request,user):
        user = get_object_or_404(User,id=user)
        
        isOwner = request.user.id == user.id
        stars_count = user.stars_count
        subscribers_count = user.subs_count
        context = {'isOwner':isOwner,'user': user,'stars_count':stars_count,'subscribers_count':subscribers_count}
        return render(request,'profile/profile.html',context=context)

class ProfileEdit(views.View):
    def get(self,request):
        if not request.user.is_authenticated: return redirect(reversed('signIn'))
        
        form = forms.UserAdditionalForm(instance=request.user)
        return render(request,'gt_form.html',context={'form':form,'title': 'Редактировать профиль'})
    def post(self,request):
        if not request.user.is_authenticated: return redirect(reversed('signIn'))
        instance = request.user
        
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
            return render(request,'video/video_list.html', context={'videos': queryset})
# Same as UserVideos   
class UserLiked(views.View):
    # Returns query of user liked videos    
    def get(self,request,user):
            queryset = UserVideoRelation.objects.all().filter(grade=1,user__id=user).select_related('video')
            queryset = [q.video for q in queryset]
            return render(request,'video/video_list.html',context={'videos': queryset})


class SubscribeButtonView(views.View):
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
    def get(self,request,user):
        videos = models.WatchHistory.objects.filter(viewer__id=user).select_related('video').order_by('-id')
        videos = [v.video for v in videos]
        context = {'videos':videos,'title':'История'}
        return render(request,'video/video_list.html',context=context)
    def delete(self,request):
        if request.user.is_authenticated:
            tasks.clear_history.delay(request.user.id)
            return render(request,'alerts/success.html',context={'desc': 'История очищена'})
        else: 
            return render(request,'alerts/error.html',context={'desc': 'История не очищена'})

class SubList(views.View):
    def get(self, request, user_id):

        queryset = models.Subscription.objects.filter(active=True,subscriber_id=user_id).select_related('author')
        context = {'queryset': queryset}
        return render(request, 'sub_list/sub_list.html', context = context)
        
        
class MySubList(views.View):
    def get(self,request):
        if request.user.is_authenticated:
            user_id = request.user.id    
            return redirect(f'{user_id}/sub_list')
        return redirect(reverse('signIn'))