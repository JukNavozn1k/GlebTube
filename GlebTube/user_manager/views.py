from django.shortcuts import render,redirect,HttpResponse

from django import views

from . import forms
from . import models
from video_manager.models import Video,RateVideo

from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User



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
            
            likes_count = RateVideo.objects.all().filter(grade=1,content__in = Video.objects.filter(author=user)).count()
            context = {'username': user.username,'isOwner':isOwner,'likes_count':likes_count}
            return render(request,'profile.html',context=context)
        except User.DoesNotExist: 
            raise Http404("The requested resource was not found.")

# Base model, stores similar methods
class UserContent(views.View):
    
    # generates video template
    def gen_template(self,video):
            template = f"""
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 p-3 video_{video.id}">
                    
                    <div class="card shadow-sm border-0" onclick="location.href='/watch/{video.id}'" style="cursor: pointer;" title="{video.caption}">
                    
                    <img class="bd-placeholder-img card-img-top rounded" src="{video.img.url}" width="100%" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false">
                    <div class="card-body">
                        <p class="card-text text-uppercase font-weight-bold text-truncate overflow-hidden">{video.caption}</p>
                        <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                            <small class="text-body-secondary">Дата выхода: {video.date_uploaded.strftime("%m.%d.%Y %H:%M")} </small>
                            <small class="text-body-secondary">Количество просмотров: {video.views}</small>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            """
            return template
# Uses the methods of the underlying model to output the video queue
class UserVideos(UserContent):
    # Returns query of user videos    
    def get(self,request,user):
            user = User.objects.get(username=user)
            response = f'<h5 class="card-title font-weight-bold">Видео пользователя: {user.username}</h5><div class="row">'
            for video in Video.objects.filter(author=user):
                response += self.gen_template(video)
            response += '</div>'
            return HttpResponse(response)
# Same as UserVideos   
class UserLiked(UserContent):
    # Returns query of user liked videos    
    def get(self,request,user):
            user = User.objects.get(username=user)
            response = f'<h5 class="card-title font-weight-bold">Видео, которые нравятся пользователю: {user.username}</h5><div class="row">'
            for liked_video in RateVideo.objects.all().filter(grade=1,author=user):
                response += self.gen_template(liked_video.content)
            response += '</div>'
            return HttpResponse(response)






# Clean's request user history
def delete_history(request):
    if request.user.is_authenticated :
        models.History.objects.all().filter(viewer=request.user).delete()
        return HttpResponse("",status=200)
    else: return HttpResponse("",status=403)