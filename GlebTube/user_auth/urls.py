from django.urls import path

from . import views


urlpatterns = [
   path('login/',views.Login.as_view()),
   path('reg/',views.Reg.as_view()),
]
