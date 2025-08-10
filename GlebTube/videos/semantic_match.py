# from django.db import transaction
# from .semantic_search import encode_caption
from videos.models import Video

def format_video_text(video: Video) -> str:
    # Формируем строку из всех нужных полей для энкодинга
    description = video.description or ""
    date_uploaded = video.date_uploaded.isoformat() if video.date_uploaded else ""
    return (
        f"{video.caption} {description} {video.author.username} "
        f"{video.duration} {video.stars_count} "
        f"{date_uploaded}"
    )

# def update_single_video_embedding(video: Video):
#     video = Video.objects.select_related('author').get(pk=video.pk)
#     text = format_video_text(video)
#     embedding = encode_caption(text)  
#     video.video_embedding = embedding 
#     video.save(update_fields=['video_embedding'])
