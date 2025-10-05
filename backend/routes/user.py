from fastapi import APIRouter

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile")
def get_profile():
    return {"username": "vlada", "email": "example@mail.ru", "pets_count": 2}
