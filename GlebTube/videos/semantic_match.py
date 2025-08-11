
from videos.models import Video
from profiles.models import WatchHistory

def format_video_text(video: Video) -> str:
    parts = []
    parts.append(f"caption: {video.caption or ''}")
    if video.description:
        parts.append(f"description: {video.description}")
    if video.author:
        parts.append(f"author: {video.author.username}")
        if video.author.profile_description:
            parts.append(f"author_bio: {video.author.profile_description}")
    if hasattr(video, 'stars_count'):
        parts.append(f"stars_count: {video.stars_count}")
    if hasattr(video, 'views'):
        parts.append(f"views: {video.views}")
    if hasattr(video.author, 'stars_count'):
        parts.append(f"author_stars: {video.author.stars_count}")
    if hasattr(video.author, 'subs_count'):
        parts.append(f"author_subs: {video.author.subs_count}")
    if video.date_uploaded:
        parts.append(f"date_uploaded: {video.date_uploaded.isoformat()}")

    return " | ".join(parts)

