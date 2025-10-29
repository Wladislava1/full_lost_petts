from sqlalchemy.orm import Session
from backend.models import Ad
from backend.schemas.ad import AdCreate

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
