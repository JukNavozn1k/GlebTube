from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from contextlib import asynccontextmanager


class MongoDatabase:
    def __init__(self, mongo_url: str, database_name: str, document_models: list, **kwargs):
        """
        :param mongo_url: URL для подключения к MongoDB, например, "mongodb://user:pass@host:port/dbname"
        :param database_name: Название базы данных
        :param document_models: Список моделей документов для инициализации Beanie (например, [Model1, Model2])
        :param kwargs: Дополнительные параметры для AsyncIOMotorClient
        """
        self.mongo_url = mongo_url
        self.database_name = database_name
        self.document_models = document_models
        self.client = AsyncIOMotorClient(self.mongo_url, **kwargs)
        self.db = self.client[self.database_name]

    async def init(self):
        """
        Инициализирует Beanie с указанными моделями.
        """
        await init_beanie(database=self.db, document_models=self.document_models)

    async def drop_all(self):
        """
        Удаляет всю базу данных.
        """
        await self.client.drop_database(self.database_name)

    async def dispose(self):
        """
        Закрывает подключение к базе данных.
        """
        self.client.close()

    @asynccontextmanager
    async def get_client(self):
        """
        Контекстный менеджер для работы с клиентом MongoDB.
        В большинстве случаев Motor-клиент является потокобезопасным, поэтому
        можно использовать один экземпляр клиента на всё приложение.
        """
        try:
            yield self.client
        finally:
            pass  # Дополнительные действия при выходе из контекста можно добавить здесь.
