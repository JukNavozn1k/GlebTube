# filters.py
from django_filters import rest_framework as filters
from django.db.models import Exists, OuterRef, Value, BooleanField
from profiles.models import Subscription
from videos.models import UserVideoRelation, UserCommentRelation, Video,CommentVideo
from auths.models import User

class UserFilter(filters.FilterSet):
    subscribed = filters.BooleanFilter(method='filter_subscribed')

    class Meta:
        model = User
        fields = ['username']  # только реальные поля модели

    def filter_subscribed(self, queryset, name, value):
        """
        Фильтр пользователей по подписке текущего пользователя.
        """
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()  # или queryset.annotate(subscribed=False) ?
        
        subquery = Subscription.objects.filter(
            subscriber_id=user.id,
            channel_id=OuterRef('pk'),
            active=True
        )
        queryset = queryset.annotate(subscribed=Exists(subquery))
        if value:
            return queryset.filter(subscribed=True)
        else:
            return queryset.filter(subscribed=False)



class VideoFilter(filters.FilterSet):
    starred = filters.BooleanFilter(method='filter_starred')

    class Meta:
        model = Video
        fields = ['channel', 'starred']

    def filter_starred(self, queryset, name, value):
        user = self.request.user
        if user.is_authenticated:
            subquery = UserVideoRelation.objects.filter(
                video_id=OuterRef('pk'), user=user, grade=1
            )
            queryset = queryset.annotate(starred=Exists(subquery))
        else:
            queryset = queryset.annotate(starred=Value(False, output_field=BooleanField()))
        return queryset.filter(starred=value)


class CommentFilter(filters.FilterSet):
    starred = filters.BooleanFilter(method='filter_starred')

    class Meta:
        model = CommentVideo
        fields = ['video', 'starred']

    def filter_starred(self, queryset, name, value):
        user = self.request.user
        if user.is_authenticated:
            subquery = UserCommentRelation.objects.filter(
                comment_id=OuterRef('pk'), user=user, grade=1
            )
            queryset = queryset.annotate(starred=Exists(subquery))
        else:
            queryset = queryset.annotate(starred=Value(False, output_field=BooleanField()))
        return queryset.filter(starred=value)