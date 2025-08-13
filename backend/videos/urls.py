from django.urls import path

from . import views



urlpatterns = [

   path('delete_video/<int:video_id>',views.delete_video,name='delete_video'),
   path('my_videos/',views.my_videos,name='my_videos'),
   path('search/', views.search_videos,name='search'),
   path('search_my_videos/',views.search_my_videos, name='search_my_videos'),
   path('upload/',views.UploadVideo.as_view(),name='upload'),
   path('edit/video/<int:video_id>',views.EditVideo.as_view(),name='edit_video'),
]
