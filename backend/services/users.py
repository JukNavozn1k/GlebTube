import bcrypt
from .jwt_auth import jwt_auth_service,JWTAuthService


from .base import AbstractCRUDService,FileService
from repositories.users import user_repository

class UserService(AbstractCRUDService):
    def __init__(self, repository, auth_service : JWTAuthService):
        self.repository = repository
        self.auth_service = auth_service
        self.file_service = FileService('users')

    async def login(self, data: dict):
        res = await self.repository.retrieve_by_username(data['username'])
        if res is None:
            return None
        if self.check_password(data['password'], res['password']):
            return self.auth_service.create_access_token({'sub': res['username']})
        return None

    async def register(self, data: dict):
        data['password'] = self.hash_password(data['password'])
        usr = await self.repository.retrieve_by_username(data['username'])
        if not usr:
            res = await self.repository.create(data)
            return res
        raise Exception('User already exists')
        

    def hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed_password.decode('utf-8')

    def check_password(self, password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    async def retrieve_by_token(self, token: str) -> dict:
        token = self.auth_service.parse_token(token)
        username = str(token['sub'])
        return await self.repository.retrieve_by_username(username)

    async def get_users(self):
        return await self.repository.list()
    async def get_user(self,user_id: any):
        return await self.repository.retrieve(user_id)

    async def update_picture(self, file):
        return await self.file_service.upload(file)
def get_user_service(user_repository, auth_service) -> UserService:
    return UserService(user_repository, auth_service)




user_service = get_user_service(user_repository, jwt_auth_service)