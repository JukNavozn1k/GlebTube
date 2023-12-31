from django.urls import path

from . import views


urlpatterns = [
   path('login/',views.Login.as_view()),
   path('reg/',views.Reg.as_view()),
   path('logout/', views.Logout.as_view()),

   path('profile/<path:user>',views.Profile.as_view()),

   path('profile_action/<path:user>/videos',views.UserVideos.as_view()),
   path('profile_action/<path:user>/liked_videos',views.UserLiked.as_view()),
   path('profile_action/<path:user>/subscribe',views.Subscribe.as_view()),

   path('delete/history',views.delete_history)
]
