from fastapi import APIRouter, HTTPException, status, Depends,UploadFile,Query,File,Form

from core import ObjectID

from schemas.users import UserOut,UserIn
from schemas.pagination import PaginatedResponse
from services.users import user_service

from dependencies.auth import get_current_user



from typing import Optional,Any

router = APIRouter(prefix='/users', tags=['Users'])

@router.post('/', response_model=str)
async def create(user: dict = Depends(get_current_user)):
    return 'hmm'
