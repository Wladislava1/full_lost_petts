import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Role(str, enum.Enum):
    user = "user"
    admin = "admin"
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    city = Column(String, nullable=True, default=None)
    contacts = Column(JSON, nullable=True, default=None)
    
    role = Column(Enum(Role), default=Role.user, nullable=False)
    
    ads = relationship("Ad", back_populates="owner")

class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True) 
    title = Column(String, index=True)
    city = Column(String, index=True)
    description = Column(String)
    image = Column(String, nullable=True)
    contact_info = Column(JSON, nullable=True)
    animal_name = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="ads")