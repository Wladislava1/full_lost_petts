from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    password_repeat: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    name: str
    email: str

class UserProfile(BaseModel):
    name: str
    email: str
    city: str | None = None
    contacts: list[str] = []

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