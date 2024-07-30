from rest_framework.serializers import *
import videos.models as md

class VideoApiSerializer(ModelSerializer):
    class Meta:
        model = md.Video
        exclude = ('video', )
        # fields = ('id', 'caption', 'description', 'thumbnail', 'duration', 'hls', 
        #           'status', 'is_running', 'views', 'stars_count', 'date_uploaded', 'author')

class CommentsApiSerializer(ModelSerializer):
    class Meta:
        model = md.Video

        exclude = ()
    
        