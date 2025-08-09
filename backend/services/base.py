from repositories import AbstractRepository
from abc import ABC

class AbstractCRUDService(ABC):
    def __init__(self, repository: AbstractRepository):
        self.repository = repository

    async def create(self, data):
        return await self.repository.create(data)

    async def retrieve(self, obj_id):
        return await self.repository.retrieve(obj_id)

    async def list(self, filters=None, limit: int = 10, offset: int = 0):
        return await self.repository.list(filters, limit=limit, offset=offset)

    async def update(self, obj_id, data):
        return await self.repository.update(obj_id, data)

    async def delete(self, obj_id):
        return await self.repository.delete(obj_id)
