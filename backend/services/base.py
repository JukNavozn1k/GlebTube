from repositories import AbstractRepository
from abc import ABC

class AbstractService(ABC):
    def __init__(self, repo: AbstractRepository):
        self.repo = repo

    async def create(self, data):
        return await self.repo.create(data)

    async def retrieve(self, fdb_id):
        return await self.repo.retrieve(fdb_id)

    async def list(self, filters=None, limit: int = 10, offset: int = 0):
        return await self.repo.list(filters, limit=limit, offset=offset)

    async def update(self, fdb_id, data):
        return await self.repo.update(fdb_id, data)

    async def delete(self, fdb_id):
        return await self.repo.delete(fdb_id)
