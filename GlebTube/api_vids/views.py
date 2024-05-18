from rest_framework.viewsets import ModelViewSet

from video_manager.models import Video,RateVideo,CommentVideo

from .serializers import VideoSerializer,RateVideoSerializer,CommentVideoSerializer

class VideoViewSet(ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class RateVideoViewSet(ModelViewSet):
    queryset = RateVideo.objects.all()
    serializer_class = RateVideoSerializer

class CommentVideoViewSet(ModelViewSet):
    queryset = CommentVideo.objects.all()
    serializer_class = CommentVideoSerializer