from rest_framework.routers import SimpleRouter
import api.views as views

from django.urls import path,include




smp = SimpleRouter()
smp.register('video', views.VideoApiView)
smp.register('user-video-relation', views.UserVideoRelationApiView)
smp.register('user', views.UserApiView)
smp.register('comment', views.CommentsApiView)

urlpatterns = smp.urls + [
   path('auth/', include('djoser.urls')),
   path('auth/', include('djoser.urls.authtoken')),

]