from fastapi import APIRouter

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/")
def get_announcements():
    return [
        {"id": 1, "type": "Пропажа", "title": "Кошка", "city": "Москва"},
        {"id": 2, "type": "Находка", "title": "Пёс", "city": "Санкт-Петербург"},
    ]

@router.get("/{announcement_id}")
def get_announcement(announcement_id: int):
    return {"id": announcement_id, "title": "Кошка", "description": "Белая, с серыми пятнами"}
