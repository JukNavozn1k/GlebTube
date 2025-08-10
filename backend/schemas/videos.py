from pydantic import BaseModel, Field
from datetime import datetime
from .users import UserOut

from typing import List,Optional

from .base import EntityBase

class VideoOut(EntityBase, BaseModel):
    title: str = Field(None, min_length=1, max_length=32)
    channel: UserOut
    views: int = 0
    createdAt: datetime  = Field(default_factory=datetime.utcnow)
    duration: str = '00:00:00'
    src: str
    thumbnail: str
    description:  Optional[str] = Field(None, min_length=0, max_length=300)
    baseStars: int = 0
    tags: List[str] = []

    class Settings:
        name = "videos" 
