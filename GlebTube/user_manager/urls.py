from django.urls import path

from . import views



urlpatterns = [
  

   
   
   path('rm_video_modal/<int:video_id>',views.rm_video_modal,name='delete_video'),
   

   

   path('my_videos/',views.my_videos,name='my_videos'),
]
