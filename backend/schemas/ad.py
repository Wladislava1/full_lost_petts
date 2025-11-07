from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ContactInfo(BaseModel):
    type: str
    value: str
    is_primary: Optional[bool] = False

class AdBase(BaseModel):
    type: str
    title: str
    city: str
    description: str
    animal_name: Optional[str] = None

class AdCreate(AdBase):
    contact_info: Optional[List[ContactInfo]] = None

class AdUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    city: Optional[str] = None
    animal_name: Optional[str] = None
    description: Optional[str] = None
    contact_info: Optional[List[ContactInfo]] = None

class AdResponse(AdBase):
    id: int
    user_id: int
    image: Optional[str] = None
    contact_info: Optional[List[ContactInfo]] = None
    created_at: datetime

    class Config:
        from_attributes = True