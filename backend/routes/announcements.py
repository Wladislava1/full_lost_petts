from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.ad import AdCreate, AdResponse, AdUpdate
from backend.models import Ad
from backend.auth import get_current_user  
from backend.crud.ad import get_ads, get_ad, create_ad, update_ad, delete_ad
from backend.core.storage import storage

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=list[AdResponse])
def list_ads(db: Session = Depends(get_db)):
    return get_ads(db)

@router.get("/{ad_id}", response_model=AdResponse)
def get_ad_by_id(ad_id: int, db: Session = Depends(get_db)):
    ad = get_ad(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    return ad

@router.post("/", response_model=AdResponse)
def create_new_ad(ad: AdCreate, 
                  db: Session = Depends(get_db),
                  user = Depends(get_current_user)):
    return create_ad(db, ad, user.id)

@router.put("/{ad_id}", response_model=AdResponse)
def update_existing_ad(ad_id: int, 
                      ad_data: AdUpdate,
                      db: Session = Depends(get_db),
                      user = Depends(get_current_user)):
    updated_ad = update_ad(db, ad_id, ad_data, user.id)
    if not updated_ad:
        raise HTTPException(status_code=404, detail="Ad not found or access denied")
    return updated_ad

@router.delete("/{ad_id}")
def delete_existing_ad(ad_id: int,
                      db: Session = Depends(get_db),
                      user = Depends(get_current_user)):
    deleted_ad = delete_ad(db, ad_id, user.id)
    if not deleted_ad:
        raise HTTPException(status_code=404, detail="Ad not found or access denied")
    return {"message": "Ad deleted successfully"}

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), user = Depends(get_current_user)):
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
                   user = Depends(get_current_user)):
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.user_id == user.id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found or access denied")
    
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