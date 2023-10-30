from django.urls import path

from . import views

urlpatterns = [
  path('upload/',views.Upload.as_view()),
  path('watch/<int:video_id>',views.Watch.as_view()),
  path('rate_video/<int:video_id>/<path:action>',views.rate_video),
] 