from django.contrib import admin
from django.urls import path,include

from django.conf import settings
from django.conf.urls.static import static

from .settings import DEBUG

from . import views

import api.urls as api

urlpatterns = [
    path('',views.home),
    path('admin/', admin.site.urls),
    
    path('',include('auths.urls')),
    path('',include('profiles.urls')),
    path('',include('videos.urls')),
    path('',include('watch.urls')),
    
    path('', include('social_django.urls', namespace='social')),
    path('accounts/profile/', views.home),
    
    path('serve_hls_playlist/<int:video_id>/', views.serve_hls_playlist, name='serve_hls_playlist'),
    path('serve_hls_segment/<int:video_id>/<str:segment_name>/',views.serve_hls_segment, name='serve_hls_segment'),
    #path('api/', include(api.urlpatterns))
] 

if DEBUG:
    from debug_toolbar.toolbar import debug_toolbar_urls
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
    urlpatterns += debug_toolbar_urls()

