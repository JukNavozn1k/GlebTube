from .base import AbstractMongoRepository
from models.videos import VideoDocument
class VideoRepository(AbstractMongoRepository):
    def __init__(self):
        super().__init__(VideoDocument)
    async def retrieve_by_username(self, username: str):
        return await super().retrieve_by_field('username', username)

def get_video_repository() -> VideoRepository:
    return VideoRepository()

video_repository = get_video_repository()