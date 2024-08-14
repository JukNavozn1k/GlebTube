from django.shortcuts import render
from rest_framework.viewsets import *
from rest_framework import mixins

from videos.models import Video,CommentVideo
from auths.models import User
from api.serializers import *
# Create your views here.

from django.db.models import Prefetch,Count,Case,When

class UserApiView(mixins.RetrieveModelMixin,mixins.ListModelMixin,GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

class CommentsApiView(mixins.RetrieveModelMixin,mixins.ListModelMixin,GenericViewSet):
    queryset = CommentVideo.objects.all().prefetch_related('author').annotate(stars_count=Count(Case(When(comment_rates__grade = 1,then=1))))
    serializer_class = CommentSerializer
    


class VideoApiView(mixins.RetrieveModelMixin,mixins.ListModelMixin,GenericViewSet):

    queryset = Video.objects.all().select_related('author').prefetch_related('video_comments__author')
    serializer_class = VideoApiSerializer
    

