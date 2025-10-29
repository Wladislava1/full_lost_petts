from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.auth import get_current_user
from backend.crud.ad import get_user_ads
from backend.schemas.ad import AdResponse
from backend.schemas.user import UserProfile
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile", response_model=UserProfile)
def get_profile(user = Depends(get_current_user)):
    return UserProfile(
        name=user.name,
        email=user.email
    )

@router.get("/my_ads", response_model=list[AdResponse])
def my_ads(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return get_user_ads(db, user.id)
