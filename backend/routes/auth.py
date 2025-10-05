from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/login")
def login():
    return {"message": "Login page"}

@router.get("/register")
def register():
    return {"message": "Register page"}
