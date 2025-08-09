from pydantic import BaseModel
from core import ObjectID


# defines entity in db
# can be replaced with sql id : int
class EntityBase(BaseModel):
    id: ObjectID
