
from rest_framework.viewsets import *
from rest_framework import mixins
from videos.models import Video,CommentVideo
from auths.models import User
from api.serializers import *

from rest_framework.filters import SearchFilter,OrderingFilter

from . import permissions

from django.db.models import Count,Case,When,Prefetch,OuterRef,Exists

from videos.models import UserVideoRelation,CommentVideo,UserCommentRelation

class UserApiView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    permission_classes = [permissions.EditUserPermission]
    
    filter_backends = [SearchFilter]
    search_fields = ['username']
    

class CommentsApiView(ModelViewSet):
    queryset = CommentVideo.objects.all().prefetch_related('author').annotate(stars_count=Count
                                    (Case(When(comment_rates__grade = 1,then=1))))
    serializer_class = CommentSerializer
    
    permission_classes = [permissions.EditContentPermission]
    
    filter_backends = [OrderingFilter]
    ordering_fields = ['stars_count']
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            subquery = UserCommentRelation.objects.filter(comment_id=OuterRef('pk'),user=self.request.user,grade=1)
            queryset = queryset.annotate(user_rated=Exists(subquery))
        return queryset
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    


class VideoApiView(ModelViewSet):

        

    queryset = Video.objects.all().select_related('author') 
    serializer_class = VideoApiSerializer
    
    permission_classes = [permissions.EditContentPermission]
    
    filter_backends = [SearchFilter,OrderingFilter]
    
    search_fields = ['caption']
    ordering_fields = ['stars_count','views']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        comments = CommentVideo.objects.all()
        if self.request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(video_id=OuterRef('pk'),user=self.request.user,grade=1)
            queryset = queryset.annotate(user_rated=Exists(subquery))
            
            subquery = UserCommentRelation.objects.filter(comment_id=OuterRef('pk'),user=self.request.user,grade=1)
            comments = comments.annotate(user_rated=Exists(subquery))
            

        prefetched_comments = Prefetch('video_comments',
                                   comments.annotate(stars_count=Count
                                    (Case(When(comment_rates__grade = 1,then=1)))).prefetch_related('author'))
        
        
        return queryset.prefetch_related(prefetched_comments)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    

