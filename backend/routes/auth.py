from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud.user import create_user, authenticate_user, get_user_by_email
from backend.schemas.user import UserCreate, UserResponse, Token, UserLogin
from backend.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    if user.password != user.password_repeat:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    new_user = create_user(db, user.name, user.email, user.password)
    return new_user

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    auth_user = authenticate_user(db, user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": auth_user.email, "id": auth_user.id})
    return {"access_token": token, "token_type": "bearer"}