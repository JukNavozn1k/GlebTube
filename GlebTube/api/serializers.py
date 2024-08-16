
from rest_framework import serializers
import videos.models as video_models
from auths.models import User


class UserSerializer(serializers.ModelSerializer):
    # password = serializers.CharField(write_only=True,required=False)
    class Meta:
        model = User
        fields = ("username", "avatar", "profile_description",'stars_count', 'subs_count')
        read_only_fields = ['stars_count', 'subs_count']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    stars_count = serializers.IntegerField(default=0,read_only=True)
    user_rated = serializers.BooleanField(default=False,read_only=True)
    
    class Meta:
        model = video_models.CommentVideo
        fields = "__all__"
        read_only_fields = ['author','date_uploaded']



class VideoApiSerializer(serializers.ModelSerializer):
    
    
    class Meta:
        model = video_models.Video
        fields = '__all__'
        read_only_fields = ['hls', 'duration', 'status', 'is_running', 'views', 'stars_count', 'date_uploaded']



class UserVideoRelationApiSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = video_models.UserVideoRelation
        fields = '__all__'
        read_only_fields = ['user']


