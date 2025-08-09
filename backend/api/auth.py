from fastapi import APIRouter, HTTPException, status, Depends

from schemas.auth import AuthSchema, TokenSchema, TokenVerifySchema
from schemas.users import UserOut

from services.users import users_service, jwt_auth_service

from dependencies.auth import jwt_bearer, TokenGateway,get_current_user

router = APIRouter(prefix='/auth', tags=['Authentication'])

@router.post('/login', response_model=TokenSchema)
async def login(schema: AuthSchema):
    token = await users_service.login(schema.model_dump())
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or failed to generate token"
        )
    return token

@router.post('/register', response_model=UserOut)
async def register(schema: AuthSchema):
    try:
        user = await users_service.register(schema.model_dump())
        return user
    except Exception as e:
        raise HTTPException(status_code=409, detail='User already exists')

@router.get('/verify-token', response_model=TokenVerifySchema)
async def verify_token(token_gateway: TokenGateway = Depends(jwt_bearer)):
    try:
        token = token_gateway.get_token()
        jwt_auth_service.parse_token(f"Bearer {token}")
        return {'valid': True}
    except Exception as e:
        print(e)
        return {'valid': False}

@router.get('/me', response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    try:
        return user
    except Exception as e:
        print(f'Error {e}')
        raise HTTPException(status_code=401, detail='Invalid token')