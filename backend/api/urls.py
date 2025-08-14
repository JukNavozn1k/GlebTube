from rest_framework.routers import DefaultRouter
import api.views as views

from django.urls import path,include




router = DefaultRouter()
router.register('video', views.VideoView)
router.register('user', views.UserView)
router.register('comment', views.CommentView)

urlpatterns = router.urls + [
   path('auth/', include('djoser.urls')),
   path('auth/', include('djoser.urls.authtoken')),
   path('auth/', include('djoser.urls.jwt'))

]