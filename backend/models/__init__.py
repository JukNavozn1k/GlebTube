from .mongo import MongoDatabase
from core import settings

from .fbd import FBDDocument

# model_dir = os.path.dirname(__file__)

# for filename in os.listdir(model_dir):
#     if filename.endswith('.py') and filename not in ['__init__.py','database.py', 'mongo.py']:
#         module_name = f".{filename[:-3]}"  # убираем .py из имени файла
#         importlib.import_module(f"models.{filename[:-3]}")


mongo = MongoDatabase(settings.mongo.get_url(), settings.mongo.mongo_db_name, [FBDDocument])