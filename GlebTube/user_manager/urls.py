from django.urls import path

from . import views
from GlebTube.views import home


urlpatterns = [
   path('login/',views.Login.as_view()),
   path('reg/',views.Reg.as_view()),
   path('logout/', views.Logout.as_view()),

   path('profile/<int:user>',views.Profile.as_view()),

   path('profile_action/<int:user>/videos',views.UserVideos.as_view()),
   path('profile_action/<int:user>/liked_videos',views.UserLiked.as_view()),
   path('profile_action/<int:user>/subscribe',views.Subscribe.as_view()),
   path('accounts/profile/', home),
   path('delete/history',views.delete_history)
]
