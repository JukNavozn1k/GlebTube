from rest_framework.serializers import *
import videos.models as video_models
from auths.models import User


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "avatar", "profile_description")


class CommentSerializer(ModelSerializer):
    author = UserSerializer()
    class Meta:
        model = video_models.CommentVideo
        fields = "__all__"



class VideoApiSerializer(ModelSerializer):
    
    author = UserSerializer()
    video_comments = CommentSerializer(many=True)
    class Meta:
        model = video_models.Video
        fields = '__all__'


