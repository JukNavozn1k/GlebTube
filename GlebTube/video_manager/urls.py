from django.urls import path

from . import views

urlpatterns = [
  path('upload/',views.UploadVideo.as_view()),
  path('edit/video/<int:video_id>',views.EditVideo.as_view()),
  
  path('video/<int:video_id>',views.VideoView.as_view()),
  
  path('add_comment_video/<int:video_id>',views.CommentVideo.as_view()),
  path('rm_comment/<int:comment_id>/',views.CommentVideo.as_view()),
  
  path('fetch/video/<int:video_id>/',views.VideoPlayer.as_view()),
  path('fetch/comments/<int:video_id>/',views.CommentVideo.as_view()),
  path('rate_video/<int:video_id>/',views.RateVideoView.as_view()),

  path('serve_hls_playlist/<int:video_id>/', views.serve_hls_playlist, name='serve_hls_playlist'),
  path('serve_hls_segment/<int:video_id>/<str:segment_name>/',views.serve_hls_segment, name='serve_hls_segment'),
] 