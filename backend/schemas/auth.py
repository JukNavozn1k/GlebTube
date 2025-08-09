from pydantic import BaseModel

class AuthSchema(BaseModel):
    username: str
    password: str

class TokenSchema(BaseModel):
    token: str
    type: str

class TokenVerifySchema(BaseModel):
    valid: bool