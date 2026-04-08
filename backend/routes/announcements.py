from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Query
from typing import Optional
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.ad import AdCreate, AdResponse, AdUpdate
from backend.models import Ad, Role, User
from backend.auth import get_current_user  
from backend.crud.ad import get_ads, get_ad, create_ad, update_ad, delete_ad
from backend.core.storage import storage

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=list[AdResponse])
def list_ads(
    ad_type: Optional[str] = Query(None, alias="type"),
    animal_name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_ads(db, ad_type=ad_type, animal_name=animal_name, city=city)

@router.get("/{ad_id}", response_model=AdResponse)
def get_ad_by_id(ad_id: int, db: Session = Depends(get_db)):
    ad = get_ad(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    return ad

@router.post("/", response_model=AdResponse)
def create_new_ad(ad: AdCreate, 
                  db: Session = Depends(get_db),
                  user: User = Depends(get_current_user)):
    return create_ad(db, ad, user.id)

@router.put("/{ad_id}", response_model=AdResponse)
def update_existing_ad(ad_id: int, 
                      ad_data: AdUpdate,
                      db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    updated_ad = update_ad(db, ad_id, ad_data, user)
    if updated_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    if updated_ad is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return updated_ad

@router.delete("/{ad_id}")
def delete_announcement(
    ad_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    deleted_ad = delete_ad(db, ad_id, current_user)
    if deleted_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    if deleted_ad is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return {"message": "Успешно удалено"}

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_url = await storage.upload_file(file, user.id)
    
    return {
        "filename": file.filename,
        "url": file_url,
        "uploaded_by": user.name
    }

@router.post("/{ad_id}/upload-image")
async def upload_ad_image(ad_id: int,
                   file: UploadFile = File(...),
                   db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    if user.role != Role.admin and ad.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if ad.image:
        await storage.delete_file(ad.image)
    
    file_url = await storage.upload_file(file, user.id)
    
    ad.image = file_url
    db.commit()
    db.refresh(ad)
    
    return {
        "filename": file.filename,
        "url": file_url,
        "ad_id": ad_id,
        "message": "Image updated successfully"
    }