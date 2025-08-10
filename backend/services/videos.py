import bcrypt
from .jwt_auth import jwt_auth_service,JWTAuthService


from .base import AbstractCRUDService,FileService
from repositories.videos import video_repository

class VideoService(AbstractCRUDService):
    def __init__(self, repository):
        super().__init__(repository)
        self.video_file_service = FileService('videos')
        self.thumbnail_file_service = FileService('thumbnail')

    async def update_video(self, file):
        return await self.video_file_service.upload(file)
    
    async def update_thumbnail(self, file):
        return await self.thumbnail_file_service.upload(file)
    
def get_video_service(video_repository) -> VideoService:
    return VideoService(video_repository)

video_service = get_video_service(video_repository)