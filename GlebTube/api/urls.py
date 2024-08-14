from rest_framework.routers import SimpleRouter
import api.views as views

smp = SimpleRouter()
smp.register('video', views.VideoApiView)
smp.register('user', views.UserApiView)
smp.register('comment', views.CommentsApiView)
urlpatterns = smp.urls