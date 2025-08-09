from .base import AbstractMongoRepository
from models.users import UserDocument
class UsersRepository(AbstractMongoRepository):
    def __init__(self):
        super().__init__(UserDocument)
    async def retrieve_by_username(self, username: str):
        return await super().retrieve_by_field('username', username)

def get_users_repository():
    return UsersRepository()

users_repository = get_users_repository()