from django.shortcuts import render,redirect,HttpResponse

from django.views import View
from django.contrib.auth.models import User

from django.db.models import Q
from . import models,forms
from user_manager.models import History as hist
from .models import Video


import bleach
from django.utils.safestring import mark_safe
from markdownx.utils import markdownify

class History(View):
      # return's all watched wideo in -watched order
      def get(self,request):
          if request.user.is_authenticated:
            history = hist.objects.filter(viewer=request.user).select_related('video__author')
            
            videos = [h.video for h in history][::-1]
            context = {'videos':videos,'title':'История'}
            return render(request,'main.html',context=context)
          else: return redirect('/login')
      def delete(self,request):
          if request.user.is_authenticated:
            hist.objects.all().filter(viewer=request.user).delete() 
            return render(request,'main.html')
          else: return redirect('/login')


class UploadVideo(View):
    def get(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')
        return render(request,'upload.html',context={'form':forms.UploadForm(),'title':'Новое видео'})
    def post(self,request):
        if not request.user.is_authenticated:
            return redirect('/login')

        form = forms.UploadForm(request.POST,request.FILES)
      
        if form.is_valid():
            video  = form.save()
            video.author = request.user
            video.save()
            return render(request,'upload.html',context={'form':forms.UploadForm(),'success_alert':{'description':f'Видео успешно загружено.','title':'Новое видео'}})
        else: return render(request,'upload.html',context={'form':forms.UploadForm(),'error_alert':{'description':f'{form.errors}','title':'Новое видео'}})



class EditVideo(View):
    def get(self,request,video_id):
       video = models.Video.objects.all().filter(id=video_id).first()
       if request.user == video.author:
           form = forms.EditForm(instance=video)
           return render(request,'edit.html',context={'form':form})
       else: return redirect('/')
    def post(self,request,video_id):
       video = models.Video.objects.all().filter(id=video_id).first()
       if request.user == video.author:
           form = forms.EditForm(request.POST,request.FILES,instance=video)
           if form.is_valid():
               form.save()
               return render(request,'edit.html',context={'form':forms.EditForm(instance=video),'success_alert':{'description':f'Видео успешно отредактировано.','title':'Редактировать видео'}})
           else: return render(request,'edit.html',context={'form':forms.EditForm(instance=video),'error_alert':{'description':f'{form.errors}','title':'Редактировать видео'}})
       else: return redirect('/')
   
   






class Watch(View):
    def comment_generator(self,date,author,comment):
        return f'''
            <div class="d-flex justify-content-center row">
      <div class="col"> <!--<div class="col-md-8"> -->
          <div class="d-flex flex-column comment-section">
              <div class="bg-white p-2">
                  <div class="d-flex flex-row user-info"><img class="rounded-circle" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Israeli_blue_Star_of_David.png" width="40">
                      <div class="d-flex flex-column justify-content-start ml-2"><span class="d-block font-weight-bold name">{author}</span>
                        <span class="date text-black-50">Дата выхода: {date.strftime("%m.%d.%Y %H:%M")}</span></div>
                  </div>
                  <div class="mt-2">
                      <div class="md_content">
                      <p class="comment-text">{comment}</p>
                    </div>
                  </div> 
              </div>
          </div>
      </div>
  </div>
  '''





    def get(self,request,video_id):
        video = models.Video.objects.all().filter(id=video_id).first()
        
        video.views += 1
        video.save()

        rates = models.RateVideo.objects.all().filter(content=video)
        likes = rates.filter(grade=1).count()
        dislikes = rates.filter(grade=-1).count()
            
        if request.user.is_authenticated: 
            rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=request.user)).first()
            hist(viewer=request.user,video=video).save()
        else: rate = None
        grade = 0
        if not rate is None:
            grade = rate.grade

        comments = models.CommentVideo.objects.all().filter(instance=video).order_by('-id')
        context = {'video':video,'likes':likes,'dislikes':dislikes,'grade':grade,'comments':comments} 
        return render(request,'watch.html',context=context)

    # processing all actions with video
    def post(self,request,video_id,action):
        if request.user.is_authenticated:
          video = models.Video.objects.all().filter(id=video_id).first()
          author = request.user
          rate_actions = {'dislike':-1,'unrate' : 0,'like':1} 

          if action == "comment":
                comment = request.POST.get('comment')
                new_comment = models.CommentVideo(author=author,instance=video,content=comment)
                cleaned_comment = bleach.clean(comment,tags=bleach.ALLOWED_TAGS, attributes=bleach.ALLOWED_ATTRIBUTES)
                new_comment.save()
                return HttpResponse(self.comment_generator(new_comment.date_uploaded,new_comment.author,mark_safe(markdownify(cleaned_comment))))

          elif action in rate_actions:
                rate = models.RateVideo.objects.filter(Q(content=video) & Q(author=author)).first()
                if rate is None:
                    rate = models.RateVideo()
                    rate.content = video
                    rate.author = author
                rate.grade = rate_actions[action]
                rate.save()
                return HttpResponse("Good!",status=200)
          
        return HttpResponse("Ошибка: Необходима авторизация", status=401)
        
    
def my_videos(request):
   if request.user.is_authenticated:
        videos = models.Video.objects.all().filter(author=request.user)
        context = {'videos': videos,'author_buttons':True,'title':'Мои видео'}
        return render(request,'main.html',context=context)
   else: return redirect('/login')


def delete_video(request,video_id):
   if request.user.is_authenticated :
        video = models.Video.objects.filter(id=video_id, author=request.user).first()
        if video is None: return HttpResponse("",status=403)
        else: video.delete()
        return HttpResponse("",status=200)
   else: return HttpResponse("",status=403)