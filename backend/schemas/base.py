from beanie import PydanticObjectId
from pydantic import BaseModel


# defines entity in db
# can be replaced with sql id : int
class EntityBase(BaseModel):
    id: PydanticObjectId
