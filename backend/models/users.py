from datetime import datetime
from pydantic import Field
from beanie import Document, Indexed


class UserDocument(Document):
    """Пользовательская модель для MongoDB с RBAC"""
    username: str = Indexed(str, unique=True)
    password: str  # Хэш пароля
  
    joined_date: datetime = Field(default_factory=datetime.utcnow)

  
    class Settings:
        name = 'users'
    