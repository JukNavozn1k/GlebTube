from rest_framework.routers import SimpleRouter
import api.views as views

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from django.urls import re_path,path

schema_view = get_schema_view(
   openapi.Info(
      title="GlebTube API",
      default_version='v1',
      description="API для версий, разработанных сторонними разработчиками",
    #   terms_of_service="https://www.google.com/policies/terms/",
    #   contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)




smp = SimpleRouter()
smp.register('video', views.VideoApiView)
smp.register('user-video-relation', views.UserVideoRelationApiView)
smp.register('user', views.UserApiView)
smp.register('comment', views.CommentsApiView)

urlpatterns = smp.urls + [
   path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

]