from django.urls import path

from . import views

urlpatterns = [
  path('upload/',views.Upload.as_view()),
  path('watch/<path:video_url>',views.Watch.as_view())
] 