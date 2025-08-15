from rest_framework.routers import DefaultRouter
import api.views as views

from django.urls import path,include


from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter()
router.register('video', views.VideoView)
router.register('user', views.UserView)
router.register('comment', views.CommentView)

urlpatterns = router.urls + [
   path('auth/', include('djoser.urls')),
   # path('auth/', include('djoser.urls.authtoken')),
   path('auth/', include('djoser.urls.jwt'))

]
urlpatterns += [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]