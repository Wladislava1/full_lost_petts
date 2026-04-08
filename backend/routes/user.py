from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from backend.database import get_db
from backend.auth import get_current_user
from backend.crud.ad import get_user_ads, update_ad, delete_ad
from backend.schemas.ad import AdResponse, AdUpdate
from backend.schemas.user import UserProfile, UserUpdate
from backend.core.storage import storage # Импортируем наш S3 сторадж
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile", response_model=UserProfile)
def get_profile(user = Depends(get_current_user)):
    return UserProfile(
        id=user.id,                
        name=user.name,
        email=user.email,
        role=user.role,                 
        city=user.city or "",
        contacts=user.contacts or [],
        avatar_url=getattr(user, 'avatar_url', None)
    )

@router.put("/profile", response_model=UserProfile)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if data.name is not None:
        user.name = data.name
    if data.city is not None:
        user.city = data.city if data.city.strip() else None
    if data.contacts is not None:
        cleaned = [c.strip() for c in data.contacts if c.strip()]
        user.contacts = cleaned if cleaned else None

    db.commit()
    db.refresh(user)

    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        city=user.city or "",
        contacts=user.contacts or [],
        avatar_url=getattr(user, 'avatar_url', None) # Добавили аватарку
    )

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Файл должен быть картинкой")
    
    old_avatar = getattr(current_user, 'avatar_url', None)
    if old_avatar:
        await storage.delete_file(old_avatar) # Удаляем старую из MinIO
        
    file_url = await storage.upload_file(file, current_user.id) # Загружаем новую
    
    current_user.avatar_url = file_url
    db.commit()
    db.refresh(current_user)
    
    return {"url": file_url, "message": "Аватар успешно обновлен"}


@router.get("/my_ads", response_model=list[AdResponse])
def my_ads(db: Session = Depends(get_db), user = Depends(get_current_user)):
    return get_user_ads(db, user.id)

@router.put("/my_ads/{ad_id}", response_model=AdResponse)
def update_my_ad(ad_id: int, 
                ad_data: AdUpdate,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    updated_ad = update_ad(db, ad_id, ad_data, user)
    if updated_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    if updated_ad is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return updated_ad

@router.delete("/my_ads/{ad_id}")
def delete_my_ad(ad_id: int,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    deleted_ad = delete_ad(db, ad_id, user)
    if deleted_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    if deleted_ad is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return {"message": "Ad deleted successfully"}