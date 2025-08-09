from datetime import datetime
from pydantic import Field
from beanie import Document, Indexed

from typing import Optional

class UserDocument(Document):
    """Пользовательская модель для MongoDB с RBAC"""
    username: str = Indexed(str, unique=True)
    password: str  # Хэш пароля
  
    joined_date: datetime = Field(default_factory=datetime.utcnow)


    # Необязательный аватар
    avatar: Optional[str] = None  # URL или путь

    # Необязательное описание, ограничим по длине
    description: Optional[str] = Field(None, min_length=0, max_length=300)
  
    class Settings:
        name = 'users'
    