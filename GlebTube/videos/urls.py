from django.urls import path

from . import views



urlpatterns = [
   path('rm_video_modal/<int:video_id>',views.rm_video_modal,name='delete_video_modal'),
   path('my_videos/',views.my_videos,name='my_videos'),
   
   path('upload/',views.UploadVideo.as_view(),name='upload'),
   path('edit/video/<int:video_id>',views.EditVideo.as_view(),name='edit_video'),
]
