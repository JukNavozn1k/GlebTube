from pydantic_settings import BaseSettings
import logging
import sys

class App(BaseSettings):
    title: str = 'GlebTube API'
    version: str = '1.0.0'
    frontend_url: str = '*'
    log_level: str = 'INFO'  # добавлено
    log_format: str = '%(asctime)s | %(levelname)s | %(name)s | %(message)s'  # добавлено
    
class Auth(BaseSettings):
    secret_key: str = 'foo'
    refresh_key: str = 'bar'
    access_token_expiration: int = 15  # days
    refresh_token_expiration: int = 15


   

class MongoDB(BaseSettings):
    mongo_user: str = 'mongoadmin'
    mongo_password: str = 'secret'
    mongo_host: str = 'mongo'
    mongo_port: int = 27017
    mongo_db_name: str = 'BlockForge'
   
    def get_url(self) -> str:
        return f"mongodb://{self.mongo_user}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}/"

class Settings(BaseSettings):
    app: App = App()
    auth: Auth = Auth()
    mongo: MongoDB = MongoDB()

    def configure_logger(self):
        logger = logging.getLogger("blockforge")
        logger.setLevel(getattr(logging, self.app.log_level.upper(), logging.INFO))
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(self.app.log_format))
        if not logger.hasHandlers():
            logger.addHandler(handler)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.error").setLevel(logging.INFO)
        return logger

settings = Settings()
logger = settings.configure_logger()