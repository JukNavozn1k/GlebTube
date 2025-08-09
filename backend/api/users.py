from fastapi import APIRouter, HTTPException, status, Depends,UploadFile,Query,File,Form

from core import ObjectID

from schemas.users import UserOut,UserIn
from schemas.pagination import PaginatedResponse
from services.users import users_service

from dependencies.auth import get_current_user



from typing import Optional,Any

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

@router.put('/update/me', response_model=Any)
async def update_me(
    description: Optional[str] = Form(None),
    avatar: UploadFile = File(None),
    user: dict = Depends(get_current_user)
):
    try:
        new_user_data = UserIn()
        # Если есть новый аватар — загружаем и сохраняем путь
        if avatar:
            avatar_path =  'file_service.upload(avatar)'
            new_user_data.avatar = avatar_path

        # Если есть описание — добавляем его
        if description:
            new_user_data.description = description



        return new_user_data

        # Обновляем пользователя
        
        # res = await users_service.update(user['id'], UserIn(update_fields).model_dump())
        # return res

    except Exception as e:
        print(f'Error {e}')
        raise HTTPException(status_code=400, detail=str(e))