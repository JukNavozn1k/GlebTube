from django.urls import path 

from . import views 

urlpatterns = [
    path('profile/<int:user>',views.Profile.as_view(),name='user_profile'),

   path('profile_action/<int:user>/videos',views.UserVideos.as_view(),name='user_videos'),
   path('profile_action/<int:user>/liked_videos',views.UserLiked.as_view(),name='user_liked'),
   path('profile_action/<int:user>/subscribe',views.Subscribe.as_view(),name='subscribe'),
   path('profile_action/<int:user>/history',views.History.as_view(),name='history'),
   
    path('profile/edit/',views.ProfileEdit.as_view(),name='edit_profile'),

   path('delete/history',views.History.as_view(),name='delete_history'),
]
