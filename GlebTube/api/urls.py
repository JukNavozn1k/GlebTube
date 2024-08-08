from rest_framework.routers import SimpleRouter
import api.views as views

smp = SimpleRouter()
smp.register('video', views.VideoApiView)

urlpatterns = smp.urls