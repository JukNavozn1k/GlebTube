from typing import List
from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

from beanie import Link
from .users import UserDocument
class VideoDocument(Document):
    title: str = Field(None, min_length=1, max_length=32)
    channel: Link[UserDocument]
    views: int = 0
    createdAt: datetime  = Field(default_factory=datetime.utcnow)
    duration: str = '00:00:00'
    src: str
    thumbnail: str
    description:  Optional[str] = Field(None, min_length=0, max_length=300)
    baseStars: int
    tags: List[str]

    class Settings:
        name = "videos"  # имя коллекции в MongoDB
