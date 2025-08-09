from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router

router = APIRouter()

routers = [auth_router,users_router]

for r in routers:
    router.include_router(r)