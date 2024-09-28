from rest_framework.routers import SimpleRouter
import api.views as views

from django.urls import path,include




router = SimpleRouter()
router.register('video', views.VideoView)
router.register('user', views.UserView)
router.register('comment', views.CommentView)
router.register('history', views.WatchHistoryView)

urlpatterns = router.urls + [
   # path('auth/', include('djoser.urls')),
   path('auth/', include('djoser.urls.authtoken')),

]