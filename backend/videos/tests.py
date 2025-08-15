import os
import tempfile
import requests

from django.test import TestCase, override_settings
from django.core.files import File
from videos.models import Video
from videos.tasks import video_encode

@override_settings(MEDIA_ROOT=tempfile.gettempdir())
class VideoEncodeTaskTest(TestCase):

    def download_test_video(self, url):
        response = requests.get(url)
        response.raise_for_status()
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_file.write(response.content)
        temp_file.flush()
        return temp_file

    def test_video_encode_task(self):
        video_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" #

        temp_video = self.download_test_video(video_url)
        with open(temp_video.name, 'rb') as video_file:
            video = Video.objects.create(
                title="Test Video",
                video=File(video_file, name=os.path.basename(temp_video.name)),
                status="Pending"
            )

        result = video_encode(duration=0, video_id=video.id)

        video.refresh_from_db()
        self.assertTrue(result)
        self.assertEqual(video.status, "Completed")
        self.assertTrue(video.hls)
        self.assertTrue(os.path.exists(video.hls))
        self.assertFalse(video.is_running)
        self.assertIsNotNone(video.duration)
        self.assertTrue(video.thumbnail)

        # cleanup
        os.unlink(temp_video.name)
