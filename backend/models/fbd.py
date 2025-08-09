from datetime import datetime, UTC
from beanie import Document
from pydantic import Field

from schemas import FBDProject

class FBDDocument(Document):
    
    project: FBDProject
    downloads: int = 0
    views: int = 0
    upload_date: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_modified: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "fbd_documents"
