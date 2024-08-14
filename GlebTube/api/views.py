
from rest_framework.viewsets import *
from rest_framework import mixins
from videos.models import Video,CommentVideo
from auths.models import User
from api.serializers import *
# Create your views here.

from . import permissions

from django.db.models import Count,Case,When

class UserApiView(mixins.RetrieveModelMixin, mixins.ListModelMixin, mixins.DestroyModelMixin, mixins.UpdateModelMixin,GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    permission_classes = [permissions.EditUserPermission]
    
    

class CommentsApiView(ModelViewSet):
    queryset = CommentVideo.objects.all().prefetch_related('author').annotate(stars_count=Count(Case(When(comment_rates__grade = 1,then=1))))
    serializer_class = CommentSerializer
    
    permission_classes = [permissions.EditContentPermission]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    


class VideoApiView(ModelViewSet):

    queryset = Video.objects.all().select_related('author').prefetch_related('video_comments__author')
    serializer_class = VideoApiSerializer
    
    permission_classes = [permissions.EditContentPermission]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    

