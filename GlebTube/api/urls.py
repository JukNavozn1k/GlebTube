from rest_framework.routers import SimpleRouter
import api.views as views

from django.urls import path,include




smp = SimpleRouter()
smp.register('video', views.VideoView)

smp.register('user', views.UserView)
smp.register('comment', views.CommentView)

urlpatterns = smp.urls + [
   path('auth/', include('djoser.urls')),
   path('auth/', include('djoser.urls.authtoken')),

]