from rest_framework.serializers import ModelSerializer

from video_manager.models import Video,RateVideo,CommentVideo

class VideoSerializer(ModelSerializer):
    class Meta:
        fields = "__all__"
        model = Video

class RateVideoSerializer(ModelSerializer):
    class Meta:
        fields = "__all__"
        model = RateVideo

class CommentVideoSerializer(ModelSerializer):
    class Meta:
        fields = "__all__"
        model = CommentVideo