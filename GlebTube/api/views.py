from django.shortcuts import render
from rest_framework.viewsets import *
from rest_framework import mixins

from videos.models import Video,CommentVideo
from auths.models import User
from api.serializers import *
# Create your views here.

from . import permissions

from django.db.models import Prefetch,Count,Case,When

class UserApiView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    permission_classes = [permissions.EditUserPermission]
    
    

class CommentsApiView(mixins.RetrieveModelMixin,mixins.ListModelMixin,GenericViewSet):
    queryset = CommentVideo.objects.all().prefetch_related('author').annotate(stars_count=Count(Case(When(comment_rates__grade = 1,then=1))))
    serializer_class = CommentSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    


class VideoApiView(ModelViewSet):

    queryset = Video.objects.all().select_related('author').prefetch_related('video_comments__author')
    serializer_class = VideoApiSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    

