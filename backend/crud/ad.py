from sqlalchemy.orm import Session
from backend.models import Ad, User, Role
from backend.schemas.ad import AdCreate, AdUpdate
from backend.core.storage import storage

def get_ads(db: Session):
    return db.query(Ad).all()

def get_ad(db: Session, ad_id: int):
    return db.query(Ad).filter(Ad.id == ad_id).first()

def create_ad(db: Session, data: AdCreate, user_id: int):
    try:
        ad_data = data.model_dump()
        ad_data["user_id"] = user_id
        
        new_ad = Ad(**ad_data)
        db.add(new_ad)
        db.commit()
        db.refresh(new_ad)
        return new_ad
    except Exception as e:
        db.rollback()
        print(f"Error creating ad: {e}")
        raise e

def get_user_ads(db: Session, user_id: int):
    return db.query(Ad).filter(Ad.user_id == user_id).all()

def update_ad(db: Session, ad_id: int, data: AdUpdate, user: User):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        return None
    if user.role != Role.admin and ad.user_id != user.id:
        return False
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ad, field, value)
    
    db.commit()
    db.refresh(ad)
    return ad

def delete_ad(db: Session, ad_id: int, user: User):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        return None
    if user.role != Role.admin and ad.user_id != user.id:
        return False
    
    if ad.image:
        storage.delete_file(ad.image) 
    
    db.delete(ad)
    db.commit()
    return ad