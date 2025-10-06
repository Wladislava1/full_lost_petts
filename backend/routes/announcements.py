from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/announcements", tags=["Announcements"])

class Announcement(BaseModel):
    type: str
    title: str
    city: str
    description: str

@router.get("/")
def get_announcements():
    return [
        {"id": 1, "type": "Пропажа", "title": "Кошка", "city": "Москва"},
        {"id": 2, "type": "Находка", "title": "Пёс", "city": "Санкт-Петербург"},
    ]

@router.get("/{announcement_id}")
def get_announcement(announcement_id: int):
    return {"id": announcement_id, "title": "Кошка", "description": "Белая, с серыми пятнами"}

@router.post("/")
def create_announcement(ad: Announcement):
    return {
        "message": "Объявление создано",
        "data": ad
    }
