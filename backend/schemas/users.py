from pydantic import BaseModel
from datetime import datetime

from pydantic import Field
from typing import Optional

from .base import EntityBase

class UserIn(BaseModel):
   
    description: Optional[str] = Field(None, min_length=1, max_length=300)
    avatar: Optional[str] = None  

class UserOut(EntityBase, UserIn):
    username: str
    joined_date: datetime

    
    ...