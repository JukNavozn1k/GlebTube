
from rest_framework.viewsets import *
from rest_framework import mixins
from videos.models import Video,CommentVideo
from auths.models import User
from . import serializers

from rest_framework.response import Response
from rest_framework.decorators import action

from rest_framework.filters import SearchFilter,OrderingFilter

from . import permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Count,Case,When,Prefetch,OuterRef,Exists

from videos.models import UserVideoRelation,CommentVideo,UserCommentRelation
from profiles.models import WatchHistory

class UserView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserDetailSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly,permissions.EditUserPermission]
    
    filter_backends = [SearchFilter]
    search_fields = ['username']
    
    @action(detail=True,methods=['get'])
    def history(self,request,pk):
        queryset = WatchHistory.objects.filter(viewer_id=pk).select_related('video')    
        queryset = [entry.video for entry in queryset]                                                
        response_data = serializers.VideoSerializer(queryset,many=True)
        return Response(response_data.data)


    @action(detail=True,methods=['get'])
    def user_videos(self,request,pk):
        queryset = Video.objects.filter(author_id=pk)                                     
        response_data = serializers.VideoSerializer(queryset,many=True)
        return Response(response_data.data)

    @action(detail=True,methods=['get'])
    def user_liked(self,request,pk):
        queryset = UserVideoRelation.objects.filter(user_id=pk,grade=1).select_related('video')    
        queryset = [entry.video for entry in queryset]                                                
        response_data = serializers.VideoSerializer(queryset,many=True)
        return Response(response_data.data)

class CommentView(ModelViewSet):
    queryset = CommentVideo.objects.all().prefetch_related('author').annotate(stars_count=Count
                                    (Case(When(comment_rates__grade = 1,then=1))))
    serializer_class = serializers.CommentSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    
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
    


class VideoView(ModelViewSet):

    queryset = Video.objects.all().select_related('author') 
    serializer_class = serializers.VideoDetailSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    
    filter_backends = [SearchFilter,OrderingFilter]
    
    search_fields = ['caption']
    ordering_fields = ['stars_count','views']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        comments = CommentVideo.objects.all()
        if self.request.user.is_authenticated:
            # user_rated video (false not rated, true rated)
            subquery = UserVideoRelation.objects.filter(video_id=OuterRef('pk'),user=self.request.user,grade=1)
            queryset = queryset.annotate(user_rated=Exists(subquery))
            # user_rated comment (false not rated, true rated)
            subquery = UserCommentRelation.objects.filter(comment_id=OuterRef('pk'),user=self.request.user,grade=1)
            comments = comments.annotate(user_rated=Exists(subquery))

        prefetched_comments = Prefetch('video_comments',
                                   comments.annotate(stars_count=Count
                                    (Case(When(comment_rates__grade = 1,then=1)))).prefetch_related('author'))
        
        
        return queryset.prefetch_related(prefetched_comments)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
