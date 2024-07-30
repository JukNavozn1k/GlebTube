from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from videos.models import Video
from api.serializers import VideoApiSerializer
# Create your views here.

class VideoApiView(ModelViewSet):
    
    queryset = Video.objects.all()
    serializer_class = VideoApiSerializer