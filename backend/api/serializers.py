
from rest_framework import serializers
import videos.models as video_models
import auths.models as auth_models 
import profiles.models as profile_models

from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    subscribed = serializers.BooleanField(read_only=True, default=False)
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get("avatar"):
            data["avatar"] = settings.DEFAULT_AVATAR_URL
        return data
    class Meta:
        model = auth_models.User
        fields = ("id","username", "avatar", "bio",'baseStars', 'subscriberCount', 'subscribed')
        read_only_fields = ['baseStars', 'subscriberCount','user_videos','username', 'subscribed']


class CommentSerializer(serializers.ModelSerializer):
    channel = UserSerializer(read_only=True)
    baseStars = serializers.IntegerField(default=0,read_only=True)
    starred = serializers.BooleanField(default=False,read_only=True)
    
    class Meta:
        model = video_models.CommentVideo
        fields = "__all__"
        read_only_fields = ['channel','createdAt']



class VideoSerializer(serializers.ModelSerializer):
    
    channel = UserSerializer(read_only=True)
    starred = serializers.BooleanField(default=False,read_only=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get("thumbnail"):
            data["thumbnail"] = settings.DEFAULT_THUMBNAIL_URL
        return data
    
    class Meta:
        model = video_models.Video
        exclude = ["video_embedding"]
        read_only_fields = ['hls', 'duration', 'status', 'is_running', 'views', 'baseStars', 'createdAt']

