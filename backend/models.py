from sqlalchemy import Column, Integer, String
from .database import Base

class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    title = Column(String, index=True)
    city = Column(String, index=True)
    description = Column(String)
