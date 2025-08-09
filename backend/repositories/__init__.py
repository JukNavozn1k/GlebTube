from .base import AbstractRepository

from .fbd import FBDRepository
from models import FBDDocument



fbd_repository = FBDRepository(model=FBDDocument)

__all__ = ('AbstractRepository', 'fbd_repository')