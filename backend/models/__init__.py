from .mongo import MongoDatabase
from .users import UserDocument
from .videos import VideoDocument
from core import settings


# for filename in os.listdir(model_dir):
#     if filename.endswith('.py') and filename not in ['__init__.py','database.py', 'mongo.py']:
#         module_name = f".{filename[:-3]}"  # убираем .py из имени файла
#         importlib.import_module(f"models.{filename[:-3]}")


mongo = MongoDatabase(settings.mongo.get_url(), settings.mongo.mongo_db_name, [UserDocument, VideoDocument])