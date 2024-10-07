
from rest_framework.viewsets import *
from rest_framework import mixins
from videos.models import Video,CommentVideo
from auths.models import User
from . import serializers

from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.decorators import action,permission_classes

from rest_framework.filters import SearchFilter,OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from . import permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated
from django.db.models import Count,Case,When,Prefetch,OuterRef,Exists,Subquery

from videos.models import UserVideoRelation,CommentVideo,UserCommentRelation
from profiles.models import WatchHistory

class UserView(mixins.ListModelMixin,mixins.RetrieveModelMixin,mixins.UpdateModelMixin,GenericViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly,permissions.EditUserPermission]
    
    filter_backends = [SearchFilter]
    search_fields = ['username']
    
    @action(detail=True,methods=['get'])
    def history(self,request,pk):
        
     
        queryset = WatchHistory.objects.filter(viewer_id=pk)
        if request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(user_id=request.user.id,video_id=OuterRef('id'), grade=1)
            prefetched_data = Prefetch('video', Video.objects.all().annotate(user_rated=Exists(subquery)) .select_related('author'))
            queryset = queryset.prefetch_related(prefetched_data)
        else:
            queryset = queryset.select_related('video__author')

     
        queryset = [entry.video for entry in queryset]   
                                                    
        response_data = serializers.VideoSerializer(queryset,many=True)
        return Response(response_data.data)


    @action(detail=True,methods=['get'])
    def user_videos(self,request,pk):
        
        queryset = Video.objects.filter(author_id=pk).select_related('author')
        if request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(user_id=request.user.id,video_id=OuterRef('pk'), grade=1)  
            queryset = queryset.annotate(user_rated=Exists(subquery))                         
        response_data = serializers.VideoSerializer(queryset,many=True)
        return Response(response_data.data)

    @action(detail=True,methods=['get'])
    def user_liked(self,request,pk):
        # List of user liked
        subquery = UserVideoRelation.objects.filter(user_id=pk,grade=1).values('video_id')
        queryset = Video.objects.filter(id__in=Subquery(subquery)).select_related('author')
        # Check if viewer rated
        if request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(user_id=request.user.id,video_id=OuterRef('pk'),grade=1)
            queryset = queryset.annotate(user_rated=Exists(subquery))                                             
        response_data = serializers.VideoSerializer(queryset,many=True)
        
        return Response(response_data.data)

class CommentView(ModelViewSet):
    queryset = CommentVideo.objects.all().annotate(stars_count=Count
                                    (Case(When(comment_rates__grade = 1,then=1)))).select_related('author','instance')
    serializer_class = serializers.CommentSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    
    filter_backends = [OrderingFilter,DjangoFilterBackend]
    ordering_fields = ['stars_count']
    filterset_fields = ['instance']

    
    @action(methods=['post'],detail=True)
    def rate(self,request,pk):
        rate_obj,created = UserCommentRelation.objects.get_or_create(comment_id=pk,user=request.user)
        grade = rate_obj.grade
        if rate_obj.grade == 1: 
            rate_obj.grade = 0
        else: rate_obj.grade = 1
      
        rate_obj.save()

        return Response({'user_rated': bool(rate_obj.grade)})

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
    serializer_class = serializers.VideoSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    
    filter_backends = [SearchFilter,OrderingFilter]
    
    search_fields = ['caption']
    ordering_fields = ['stars_count','views']
    
    @action(methods=['post'],detail=True)
    def rate(self,request,pk):
        rate_obj,created = UserVideoRelation.objects.get_or_create(video_id=pk,user=request.user)
      
        if rate_obj.grade == 1: 
            rate_obj.grade = 0
        else: rate_obj.grade = 1
      
        rate_obj.save()
        
        
        return Response({'user_rated': bool(rate_obj.grade)})

    def get_queryset(self):
        queryset = super().get_queryset()
       
        if self.request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(video_id=OuterRef('pk'),user=self.request.user,grade=1)
            queryset = queryset.annotate(user_rated=Exists(subquery))
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
