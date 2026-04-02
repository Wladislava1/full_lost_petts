from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.repositories.user_repository import UserRepository
from backend.schemas.user import UserCreate, RegisterResponse, Token, UserLogin
from backend.core.security import create_access_token, create_refresh_token, decode_token, REFRESH_TOKEN_EXPIRE_DAYS

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

@router.post("/register", response_model=RegisterResponse)
def register(
    user: UserCreate, 
    response: Response,
    user_repo: UserRepository = Depends(get_user_repo)
):
    if user_repo.get_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    if user.password != user.password_repeat:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    new_user = user_repo.create(user.name, user.email, user.password)
    
    access_token = create_access_token({"sub": new_user.email, "id": new_user.id})
    refresh_token = create_refresh_token({"sub": new_user.email, "id": new_user.id})

    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax"
    )
    
    return {
        "user": new_user, 
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
def login(
    user: UserLogin, 
    response: Response,
    user_repo: UserRepository = Depends(get_user_repo)
):
    auth_user = user_repo.authenticate(user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": auth_user.email, "id": auth_user.id})
    refresh_token = create_refresh_token({"sub": auth_user.email, "id": auth_user.id})
    
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax"
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_token(request: Request, user_repo: UserRepository = Depends(get_user_repo)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("id")
    user = user_repo.get_by_id(user_id)
    if not user:
         raise HTTPException(status_code=401, detail="User no longer exists")

    new_access_token = create_access_token({"sub": user.email, "id": user.id})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}