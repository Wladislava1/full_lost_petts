from pydantic import BaseModel

class AdBase(BaseModel):
    type: str
    title: str
    city: str
    description: str

class AdCreate(AdBase):
    pass

class AdResponse(AdBase):
    id: int

    class Config:
        from_attributes = True
