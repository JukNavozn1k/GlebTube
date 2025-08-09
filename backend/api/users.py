from fastapi import APIRouter, HTTPException, status, Depends

from core import ObjectID

from schemas.users import UserOut
from schemas.pagination import PaginationParams,PaginatedResponse
from services.users import users_service, jwt_auth_service

from dependencies.auth import jwt_bearer, TokenGateway,get_current_user

from fastapi import Query 

router = APIRouter(prefix='/users', tags=['Users'])

@router.post('/list', response_model=PaginatedResponse[UserOut])
async def list(limit: int = Query(10, ge=1, le=100),
               offset: int = Query(0, ge=0),):
    result = await users_service.list(limit=limit, offset=offset)
    return PaginatedResponse[UserOut](
        total=result["total"],
        items=[UserOut(**item) for item in result["items"]],
        limit=limit,
        offset=offset
    )

@router.post('/retrieve/{user_id}', response_model=UserOut)
async def retrive(user_id: ObjectID):
    try:
        result = await users_service.retrieve(user_id)
    except Exception as e:
        HTTPException(status_code=422, detail=e.errors())
    else:
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result

