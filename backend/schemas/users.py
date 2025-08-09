from pydantic import BaseModel
from datetime import datetime

from .base import EntityBase

class UserOut(EntityBase, BaseModel):

    username: str
    joined_date: datetime