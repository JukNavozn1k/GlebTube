from django.urls import path
from . import views

urlpatterns = [
   path('login/',views.Login.as_view(),name='signIn'),
   path('reg/',views.Reg.as_view(),name='signUp'),
   path('logout/', views.Logout.as_view(),name='signOut'),
]
