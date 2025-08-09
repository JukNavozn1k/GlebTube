from fastapi import APIRouter
from .fdb_validation import router as fbd_validation_router
from .fdb_crud import router as fdb_router
from .social_auth import router as social_auth_router
router = APIRouter()

routers = [fbd_validation_router, fdb_router, social_auth_router]

for r in routers:
    router.include_router(r)