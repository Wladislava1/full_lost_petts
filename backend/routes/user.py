from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.auth import get_current_user
from backend.crud.ad import get_user_ads, update_ad, delete_ad
from backend.schemas.ad import AdResponse, AdUpdate
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

@router.put("/my_ads/{ad_id}", response_model=AdResponse)
def update_my_ad(ad_id: int, 
                ad_data: AdUpdate,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    updated_ad = update_ad(db, ad_id, ad_data, user.id)
    if not updated_ad:
        raise HTTPException(status_code=404, detail="Ad not found or access denied")
    return updated_ad

@router.delete("/my_ads/{ad_id}")
def delete_my_ad(ad_id: int,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    deleted_ad = delete_ad(db, ad_id, user.id)
    if not deleted_ad:
        raise HTTPException(status_code=404, detail="Ad not found or access denied")
    return {"message": "Ad deleted successfully"}