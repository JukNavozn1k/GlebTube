from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List

T = TypeVar("T")

class PaginationParams(BaseModel):
    limit: int = Field(10, ge=1, le=100, description="Items per page")
    offset: int = Field(0, ge=0, description="Offset of first item")

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: List[T]
    limit: int
    offset: int