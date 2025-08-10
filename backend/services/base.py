from repositories import AbstractRepository
from abc import ABC


import os
import uuid
import aiofiles


class FileService:
    def __init__(self, directory: str, base_dir: str = 'media'):
        """
        directory — директория для сохранения файлов
        """
        self.directory = os.path.join(base_dir ,directory)
        os.makedirs(self.directory, exist_ok=True)

    def _get_file_location(self, filename: str) -> str:
        """
        Генерирует путь с добавлением соли, чтобы избежать коллизий имён.
        """
        while True:
            name, ext = os.path.splitext(filename)
            salted_name = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
            file_location = os.path.join(self.directory, salted_name)
            if not os.path.exists(file_location):
                return file_location

    async def upload(self, file) -> str:
        """
        Асинхронно сохраняет загруженный файл.
        file — объект, у которого есть .filename и .read()
        """
        file_location = self._get_file_location(file.filename)
        async with aiofiles.open(file_location, 'wb') as f:
            content = await file.read()
            await f.write(content)
        return file_location

    async def upload_raw(self, filename: str, content: bytes) -> str:
        """
        Асинхронно сохраняет данные в файл.
        filename — имя файла
        content — байты содержимого
        """
        file_location = self._get_file_location(filename)
        async with aiofiles.open(file_location, 'wb') as f:
            await f.write(content)
        return file_location

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

