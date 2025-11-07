from sqlalchemy.orm import Session
from backend.models import Ad
from backend.schemas.ad import AdCreate, AdUpdate
from backend.core.storage import storage

def get_ads(db: Session):
    return db.query(Ad).all()

def get_ad(db: Session, ad_id: int):
    return db.query(Ad).filter(Ad.id == ad_id).first()

def create_ad(db: Session, data: AdCreate, user_id: int):
    new_ad = Ad(**data.model_dump(), user_id=user_id)
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)
    return new_ad

def get_user_ads(db: Session, user_id: int):
    return db.query(Ad).filter(Ad.user_id == user_id).all()

def update_ad(db: Session, ad_id: int, data: AdUpdate, user_id: int):
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.user_id == user_id).first()
    if not ad:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ad, field, value)
    
    db.commit()
    db.refresh(ad)
    return ad

async def delete_ad(db: Session, ad_id: int, user_id: int):
    ad = db.query(Ad).filter(Ad.id == ad_id, Ad.user_id == user_id).first()
    if not ad:
        return None
    
    if ad.image:
        await storage.delete_file(ad.image)
    
    db.delete(ad)
    db.commit()
    return ad