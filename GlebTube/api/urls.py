from rest_framework.routers import SimpleRouter
import api.views as views

smp = SimpleRouter()
smp.register('videod', views.VideoApiView)

urlpatterns = smp.urls