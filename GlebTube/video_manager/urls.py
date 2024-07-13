from django.urls import path

from . import views

urlpatterns = [
  path('upload/',views.UploadVideo.as_view()),
  path('edit/video/<int:video_id>',views.EditVideo.as_view()),
  path('history/',views.History.as_view()),
  path('my_videos/',views.my_videos),

  path('video/<int:video_id>',views.VideoView.as_view()),
  
  path('add_comment_video/<int:video_id>',views.CommentVideo.as_view()),
  path('rm_comment/<int:comment_id>/',views.CommentVideo.as_view()),
  

  path('rate_video/<int:video_id>/',views.RateVideoView.as_view()),
] 