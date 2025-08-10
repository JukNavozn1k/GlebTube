from abc import ABC, abstractmethod
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.users import user_service

class TokenGateway(ABC):
    @abstractmethod
    def get_token(self) -> Optional[str]:
        pass

class FastAPITokenGateway(TokenGateway):
    def __init__(self, authorization: HTTPAuthorizationCredentials = None):
        self.authorization = authorization

    def get_token(self) -> Optional[str]:
        if not self.authorization:
            return None
        return self.authorization.credentials

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> FastAPITokenGateway:
        try:
            credentials = await super().__call__(request)
            return FastAPITokenGateway(credentials)
        except:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

jwt_bearer = JWTBearer()

async def get_current_user(token_gateway: TokenGateway = Depends(jwt_bearer)):
    try:
        token = token_gateway.get_token()
        return await user_service.retrieve_by_token(f"Bearer {token}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
async def get_current_user_or_none(token_gateway: TokenGateway = Depends(jwt_bearer)):
    try:
        token = token_gateway.get_token()
        return await user_service.retrieve_by_token(f"Bearer {token}")
    except Exception as e:
        return None