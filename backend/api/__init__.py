from fastapi import APIRouter

from .auth import router as auth_router

router = APIRouter()

routers = [auth_router]

for r in routers:
    router.include_router(r)