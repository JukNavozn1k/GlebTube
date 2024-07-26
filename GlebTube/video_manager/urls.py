from django.urls import path

from . import views

urlpatterns = [
  path('upload/',views.UploadVideo.as_view(),name='upload'),
  path('edit/video/<int:video_id>',views.EditVideo.as_view(),name='edit_video'),
  
  path('video/<int:video_id>',views.VideoView.as_view(),name='video'),
  
  path('add_comment_video/<int:video_id>',views.CommentVideo.as_view(),name='add_comment'),
  path('rm_comment/<int:comment_id>/',views.CommentVideo.as_view(),name='delete_comment'),
  
  path('fetch/video/<int:video_id>/',views.VideoPlayer.as_view(),name='fetch_video'),
  path('fetch/comments/<int:video_id>/',views.CommentVideo.as_view(),name='fetch_comments'),
  path('rate_video/<int:video_id>/',views.RateVideoView.as_view(),name='rate_video'),

  path('serve_hls_playlist/<int:video_id>/', views.serve_hls_playlist, name='serve_hls_playlist'),
  path('serve_hls_segment/<int:video_id>/<str:segment_name>/',views.serve_hls_segment, name='serve_hls_segment'),
] 