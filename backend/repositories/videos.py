from .base import AbstractMongoRepository
from models.videos import VideoDocument
class VideoRepository(AbstractMongoRepository):
    def __init__(self):
        super().__init__(VideoDocument)
    async def retrieve_by_title(self, title: str, populate=['channel']):
        return await super().retrieve_by_field('title', title, populate=populate)
    

    async def retrieve(self, pk, populate = ['channel']):
        return await super().retrieve(pk, populate)
    
    async def list(self, filters = None, limit = None, offset = None, populate = ['channel']):
        return await super().list(filters, limit, offset, populate=populate)

def get_video_repository() -> VideoRepository:
    return VideoRepository()

video_repository = get_video_repository()