from django.db.models import Count, Case, When, OuterRef, Exists, Value, BooleanField, Prefetch
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .filters import UserFilter, VideoFilter, CommentFilter
from rest_framework import mixins, status
from rest_framework.decorators import action, permission_classes
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from auths.models import User
from profiles.models import WatchHistory, Subscription
from videos.models import Video, CommentVideo, UserVideoRelation, UserCommentRelation

from . import serializers, permissions
from watch import tasks

from ml.search import semantic_search_videos


class UserView(mixins.ListModelMixin,
               mixins.RetrieveModelMixin,
               mixins.UpdateModelMixin,
               GenericViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditUserPermission]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    filterset_class = UserFilter
    search_fields = ['username']
    filterset_fields = ['subscribed']

    def get_queryset(self):
        qs = User.objects.all()
        user = self.request.user
        if user.is_authenticated:
            sub_q = Subscription.objects.filter(
                subscriber_id=user.id, channel_id=OuterRef('pk'), active=True
            )
            qs = qs.annotate(subscribed=Exists(sub_q))
        else:
            qs = qs.annotate(subscribed=Value(False, output_field=BooleanField()))
        return qs
    

    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    # @action(detail=True, methods=['get'])
    # def user_subscriptions(self, request, pk):
    #     subs = Subscription.objects.filter(subscriber_id=pk, active=True)
    #     users = User.objects.filter(id__in=subs.values('channel_id'))
    #     serializer = serializers.UserSerializer(users, many=True)
    #     return Response(serializer.data)


class CommentView(ModelViewSet):
    queryset = CommentVideo.objects.all().annotate(
        baseStars=Count(Case(When(comment_rates__grade=1, then=1)))
    ).select_related('channel', 'instance')
    serializer_class = serializers.CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['baseStars']
    filterset_fields = ['instance']
    filterset_class = CommentFilter
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            subquery = UserCommentRelation.objects.filter(
                comment_id=OuterRef('pk'), user=self.request.user, grade=1
            )
            queryset = queryset.annotate(starred=Exists(subquery))
        return queryset

    def perform_create(self, serializer):
        serializer.save(channel=self.request.user)

    @action(methods=['post'], detail=True)
    def rate(self, request, pk):
        rate_obj, _ = UserCommentRelation.objects.get_or_create(
            comment_id=pk, user=request.user
        )
        rate_obj.grade = 0 if rate_obj.grade == 1 else 1
        rate_obj.save()
        return Response({'starred': bool(rate_obj.grade)})


class VideoView(ModelViewSet):
    queryset = Video.objects.all().select_related('channel')
    serializer_class = serializers.VideoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['title']
    ordering_fields = ['baseStars', 'views']
    filterset_fields = ['channel', 'starred']
    filterset_class = VideoFilter

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Семантический поиск по видео.
        GET /api/videos/search/?q=запрос
        """
        query = request.GET.get("q", "").strip()
        if not query:
            return Response({"detail": "Empty query"}, status=status.HTTP_400_BAD_REQUEST)

        # получаем queryset видео с эмбеддингами
        videos_qs = self.get_queryset().exclude(video_embedding__isnull=True)

        # сортируем по схожести
        results = semantic_search_videos(query, videos_qs)

        # сериализуем
        serializer = self.get_serializer(results, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'delete'], permission_classes=[IsAuthenticated])
    def history(self, request):
        if request.method == 'GET':
            queryset = WatchHistory.objects.filter(viewer=request.user).order_by('-watch_time')
            subquery = UserVideoRelation.objects.filter(
                user=request.user, video_id=OuterRef('id'), grade=1
            )
            prefetched_data = Prefetch(
                'video',
                queryset=Video.objects.all()
                             .annotate(starred=Exists(subquery))
                             .select_related('channel')
            )
            queryset = queryset.prefetch_related(prefetched_data)
            videos = [entry.video for entry in queryset]
            serializer = serializers.VideoSerializer(videos, many=True, context={"request": request})
            return Response(serializer.data)

        elif request.method == 'DELETE':
            deleted_count, _ = WatchHistory.objects.filter(viewer=request.user).delete()
            return Response(
                {"detail": f"History cleared. {deleted_count} items deleted."},
                status=status.HTTP_204_NO_CONTENT
            )

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(
                video_id=OuterRef('pk'), user=self.request.user, grade=1
            )
            queryset = queryset.annotate(starred=Exists(subquery))
        return queryset

    @action(methods=['post'], detail=True)
    def rate(self, request, pk):
        rate_obj, _ = UserVideoRelation.objects.get_or_create(video_id=pk, user=request.user)
        rate_obj.grade = 0 if rate_obj.grade == 1 else 1
        rate_obj.save()
        return Response({'starred': bool(rate_obj.grade)})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        tasks.refresh_views.delay(instance.id)
        if request.user.is_authenticated:
            tasks.refresh_history.delay(instance.id, request.user.id)
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(channel=self.request.user)
