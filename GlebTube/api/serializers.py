from rest_framework.serializers import *
import videos.models as md


class VideoApiSerializer(ModelSerializer):
    class Meta:
        model = md.Video
        fields = '__all__'



class CommentsApiSerializer(ModelSerializer):
    class Meta:
        model = md.Video

        exclude = ()
    
        