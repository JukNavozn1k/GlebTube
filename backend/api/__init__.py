from fastapi import APIRouter

router = APIRouter()

routers = []

for r in routers:
    router.include_router(r)