from rest_framework.serializers import *
import video_manager.models as md

class VideoSerializer(ModelSerializer):
    class Meta:
        model = md.Video
        exclude = ('video', )
        # fields = ('id', 'caption', 'description', 'thumbnail', 'duration', 'hls', 
        #           'status', 'is_running', 'views', 'stars_count', 'date_uploaded', 'author')

class CommentsSerializer(ModelSerializer):
    class Meta:
        model = md.Video
        exclude = ()
    
        