from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()

router.register(r'videos',views.VideoViewSet)
router.register(r'video_rates',views.RateVideoViewSet)
router.register(r'video_comments',views.CommentVideoViewSet)
# router.register(r'/rate_videos',serializers.RateVideoSerializer)
# router.register(r'/comment_videos',serializers.CommentVideoSerializer)

urlpatterns = router.urls
