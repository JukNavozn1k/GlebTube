
from rest_framework import serializers
import videos.models as video_models
import auths.models as auth_models 
import profiles.models as profile_models



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = auth_models.User
        fields = ("username", "avatar")
        read_only_fields = []


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    stars_count = serializers.IntegerField(default=0,read_only=True)
    user_rated = serializers.BooleanField(default=False,read_only=True)
    
    class Meta:
        model = video_models.CommentVideo
        fields = "__all__"
        read_only_fields = ['author','date_uploaded']



class VideoDetailSerializer(serializers.ModelSerializer):
    
    author = UserSerializer(read_only=True)
    user_rated = serializers.BooleanField(default=False,read_only=True)
    
    video_comments = CommentSerializer(many=True,read_only=True)
    
    class Meta:
        model = video_models.Video
        fields = '__all__'
        read_only_fields = ['hls', 'duration', 'status', 'is_running', 'views', 'stars_count', 'date_uploaded','video_comments']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = video_models.Video
        fields = '__all__'
        read_only_fields = ['hls', 'duration', 'status', 'is_running', 'views', 'stars_count', 'date_uploaded','video_comments']


class WatchHistorySerializer(serializers.ModelSerializer):
    # viewer = UserSerializer(read_only=True)
    # video = VideoSerializer()   
    class Meta:
        model = profile_models.WatchHistory
        fields = '__all__'


class UserDetailSerializer(serializers.ModelSerializer):
    user_videos = VideoSerializer(many=True,read_only=True)
    password = serializers.CharField(required=True,write_only=True)
    email = serializers.EmailField(required=False, write_only=True)
    class Meta:
        model = auth_models.User
        fields = ("username", "avatar", "profile_description",'stars_count', 'subs_count','user_videos','password','email')
        read_only_fields = ['stars_count', 'subs_count','user_videos']
