from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth import get_current_admin_user
from backend.models import User
from backend.schemas.user import UserResponse, UserRoleUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db), 
    admin_user: User = Depends(get_current_admin_user)
):
    """Получение всех пользователей (только для администраторов)"""
    users = db.query(User).all()
    return users

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int, 
    role_data: UserRoleUpdate, 
    db: Session = Depends(get_db), 
    admin_user: User = Depends(get_current_admin_user)
):
    """Смена роли пользователя (только для администраторов)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.role = role_data.role
    db.commit()
    return {"message": f"Роль пользователя изменена на {user.role.value}"}