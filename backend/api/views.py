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

from ml.search import semantic_search_videos,semantic_search_videos_by_embedding



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
        

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def subscribe(self, request, pk=None):
        """
        Subscribe / unsubscribe channel
        """
        channel = get_object_or_404(User, pk=pk)

        if channel == request.user:
            return Response({"detail": "Can't subscribe yourself."},
                            status=status.HTTP_400_BAD_REQUEST)

        sub, _ = Subscription.objects.get_or_create(
            subscriber=request.user, channel=channel
        )

        # переключаем статус
        sub.active = not sub.active
        sub.save()

        return Response({
            "channel_id": channel.id,
            "subscribed": sub.active
        })

class CommentView(ModelViewSet):
    queryset = CommentVideo.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, permissions.EditContentPermission]
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['baseStars', 'createdAt']
    filterset_fields = ['video', 'parent']
    
    def perform_create(self, serializer):
        serializer.save(channel=self.request.user)

    @action(methods=['post'], detail=True)
    def rate(self, request, pk):
        rate_obj, _ = UserCommentRelation.objects.get_or_create(
            comment_id=pk, user=request.user
        )
        rate_obj.grade = 0 if rate_obj.grade == 1 else 1
        rate_obj.save()
        return Response({
            "comment_id": pk,
            "starred": bool(rate_obj.grade)
        })

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_authenticated:
            # starred для комментария
            subquery = UserCommentRelation.objects.filter(
                comment_id=OuterRef('pk'), user=user, grade=1
            )
            queryset = queryset.annotate(starred=Exists(subquery))

            # подготовим queryset для channel с subscribed-аннотацией
            channel_sub_q = Subscription.objects.filter(
                subscriber_id=user.id, channel_id=OuterRef('pk'), active=True
            )
            users_qs = User.objects.annotate(subscribed=Exists(channel_sub_q))

            queryset = queryset.prefetch_related(
                Prefetch('channel', queryset=users_qs)
            )
        else:
            queryset = queryset.annotate(starred=Value(False, output_field=BooleanField()))
            users_qs = User.objects.annotate(subscribed=Value(False, output_field=BooleanField()))
            queryset = queryset.prefetch_related(Prefetch('channel', queryset=users_qs))

        return queryset



class VideoView(ModelViewSet):
    queryset = Video.objects.all()
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
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        base_video = self.get_object()
        if not base_video.video_embedding:
            qs = self.get_queryset().exclude(pk=base_video.pk)
            serializer = self.get_serializer(
            ranked_videos, many=True, context={"request": request}
        )
            return Response(serializer.data)

        qs = (
            self.get_queryset()
            .exclude(pk=base_video.pk)
            .exclude(video_embedding__isnull=True)
        )

        ranked_videos = semantic_search_videos_by_embedding(
            base_video,
            qs,
            normalize=True
        )

        serializer = self.get_serializer(
            ranked_videos, many=True, context={"request": request}
        )
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
        queryset = Video.objects.all()  # уберите class-level .select_related('channel') иначе prefetch не сработает
        user = self.request.user

        # annotation для "starred" (у вас уже был)
        if user.is_authenticated:
            starred_sq = UserVideoRelation.objects.filter(
                video_id=OuterRef('pk'), user=user, grade=1
            )
            # подготовим queryset для channel с subscribed-аннотацией
            channel_sub_q = Subscription.objects.filter(
                subscriber_id=user.id, channel_id=OuterRef('pk'), active=True
            )
            users_qs = User.objects.annotate(subscribed=Exists(channel_sub_q))
            queryset = queryset.annotate(starred=Exists(starred_sq)).prefetch_related(
                Prefetch('channel', queryset=users_qs)
            )
        else:
            queryset = queryset.annotate(starred=Value(False, output_field=BooleanField()))
            # можно явно префетчить каналы с subscribed=False
            users_qs = User.objects.annotate(subscribed=Value(False, output_field=BooleanField()))
            queryset = queryset.prefetch_related(Prefetch('channel', queryset=users_qs))

        return queryset

    @action(methods=['post'], detail=True)
    def rate(self, request, pk):
        rate_obj, _ = UserVideoRelation.objects.get_or_create(video_id=pk, user=request.user)
        rate_obj.grade = 0 if rate_obj.grade == 1 else 1
        rate_obj.save()
        return Response({
            "video_id": pk,
            "starred": bool(rate_obj.grade)
        })

    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        tasks.refresh_views.delay(video.id)
        if request.user.is_authenticated:
            tasks.refresh_history.delay(video.id, request.user.id)
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(channel=self.request.user)
