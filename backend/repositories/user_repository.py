from sqlalchemy.orm import Session
from backend.models import User
from backend.core.security import hash_password, verify_password

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, name: str, email: str, password: str) -> User:
        hashed = hash_password(password)
        new_user = User(
            name=name,
            email=email,
            hashed_password=hashed
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def authenticate(self, email: str, password: str) -> User | None:
        user = self.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user