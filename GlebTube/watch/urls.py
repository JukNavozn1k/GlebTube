from django.urls import path

from . import views

urlpatterns = [
  
  
  path('video/<int:video_id>',views.VideoView.as_view(),name='video'),
  
  path('add_comment_video/<int:video_id>',views.CommentVideo.as_view(),name='add_comment'),
  path('rm_comment/<int:comment_id>/',views.CommentVideo.as_view(),name='delete_comment'),
  
  path('fetch/video/<int:video_id>/',views.VideoPlayer.as_view(),name='fetch_video'),
  path('fetch/comments/<int:video_id>/',views.CommentVideo.as_view(),name='fetch_comments'),
  path('rate_video/<int:video_id>/',views.RateVideoView.as_view(),name='rate_video'),

  
] 