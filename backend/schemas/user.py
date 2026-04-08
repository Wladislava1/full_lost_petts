from pydantic import BaseModel, EmailStr
from backend.models import Role

class UserBase(BaseModel):
    name: str
    email: str
    password: str
    password_repeat: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    password_repeat: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    avatar_url: str | None = None

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: Role

class UserProfile(BaseModel):
    id: int          
    name: str
    email: str
    role: Role         
    city: str | None = None
    contacts: list[str] = []
    avatar_url: str | None = None

class UserUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    contacts: list[str] | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class RegisterResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"