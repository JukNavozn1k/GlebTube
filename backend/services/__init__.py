
from .jwt_auth import JWTAuthService
from core import settings

from .fbd import FBDService
from repositories import fbd_repository

fbd_service = FBDService(fbd_repository)


jwt_auth_service = JWTAuthService(
        secret_key=settings.auth.secret_key,
        refresh_key=settings.auth.refresh_key,
        access_token_expiration=settings.auth.access_token_expiration,
        refresh_token_expiration=settings.auth.refresh_token_expiration,
    )