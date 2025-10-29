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

class Token(BaseModel):
    access_token: str
    token_type: str