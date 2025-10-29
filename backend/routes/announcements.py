from fastapi import APIRouter, Depends,File, UploadFile
import shutil
import uuid
import os
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.ad import AdCreate, AdResponse
from backend.auth import get_current_user  
from backend.crud.ad import get_ads, get_ad, create_ad

router = APIRouter(prefix="/announcements", tags=["Announcements"])
UPLOAD_DIR = "media"

@router.get("/", response_model=list[AdResponse])
def list_ads(db: Session = Depends(get_db)):
    return get_ads(db)

@router.get("/{ad_id}", response_model=AdResponse)
def get_ad_by_id(ad_id: int, db: Session = Depends(get_db)):
    return get_ad(db, ad_id)

@router.post("/", response_model=AdResponse)
def create_new_ad(ad: AdCreate, 
                  db: Session = Depends(get_db),
                  user = Depends(get_current_user)):
    return create_ad(db, ad, user.id)

@router.post("/upload")
def upload_image(file: UploadFile = File(...), user = Depends(get_current_user)):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": filename, "uploaded_by": user.name}