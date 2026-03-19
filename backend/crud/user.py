from sqlalchemy.orm import Session
from backend.models import User
from backend.core.security import hash_password, verify_password

def create_user(db: Session, name: str, email: str, password: str):
    hashed = hash_password(password)
    new_user = User(
        name=name,
        email=email,
        hashed_password=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()