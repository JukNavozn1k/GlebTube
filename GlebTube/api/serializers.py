
from rest_framework import serializers
import videos.models as video_models
from auths.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "avatar", "profile_description",'stars_count', 'subs_count')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer()
    stars_count = serializers.IntegerField(default=0)
    class Meta:
        model = video_models.CommentVideo
        fields = "__all__"



class VideoApiSerializer(serializers.ModelSerializer):
    
    author = UserSerializer()
    video_comments = CommentSerializer(many=True)
    class Meta:
        model = video_models.Video
        fields = '__all__'


