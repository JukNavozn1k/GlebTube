
from videos.models import Video
from profiles.models import WatchHistory

def format_video_text(video: Video) -> str:
    parts = []
    parts.append(f"caption: {video.caption or ''}")
    if video.author:
        parts.append(f"channel: {video.author.username}")
    return " | ".join(parts)
