
from videos.models import Video

def format_video_text(video: Video) -> str:
    description = video.description or ""
    date_uploaded = video.date_uploaded.isoformat() if video.date_uploaded else ""

    author = video.author
    profile_description = author.profile_description or ""
    stars_count = getattr(video, 'stars_count', 0)  # если есть у видео
    views_count = getattr(video, 'views', 0)
    author_stars = getattr(author, 'stars_count', 0)
    author_subs = getattr(author, 'subs_count', 0)
    return (
        f"{video.caption} {description} {author.username} "
        f"{video.duration} {stars_count} {views_count} "
        f"{author_stars} {author_subs} "
        f"{date_uploaded}"
        f"{profile_description} "
        
    )


