from rest_framework.routers import DefaultRouter

import api.views as views

from django.urls import path,include
from api.views import VideoView
from GlebTube import views as core_views


from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter(trailing_slash='/?')

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
    # Explicit HLS endpoints to avoid any router edge-cases
    path('video/<int:pk>/hls/', VideoView.as_view({'get': 'hls'}), name='video-hls'),
    # Use working core view to serve segments
    path('video/<int:video_id>/hls_segment/<path:segment_name>', core_views.serve_hls_segment, name='video-hls-segment'),
]