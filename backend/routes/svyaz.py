import hmac
import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.security import create_access_token, create_refresh_token, REFRESH_TOKEN_EXPIRE_DAYS
from backend.database import get_db
from backend.models import HandoffCode, Role, User

router = APIRouter(prefix="/auth/svyaz", tags=["Svyaz ID"])


class LookupBody(BaseModel):
    email: str = ""
    svyaz_id: str = ""


class SessionBody(BaseModel):
    email: str
    name: str = ""
    phone: str = ""
    city: str = ""
    avatar_url: str | None = None
    create: bool = False
    svyaz_id: str = ""


class LinkBody(BaseModel):
    email: str
    password: str
    svyaz_id: str = ""


class ConsumeBody(BaseModel):
    code: str


def require_secret(request: Request) -> None:
    expected = os.getenv("SVYAZ_HANDOFF_SECRET", "dev-svyaz-lost-pets")
    received = request.headers.get("x-svyaz-secret", "")
    if len(received) != len(expected) or not hmac.compare_digest(received, expected):
        raise HTTPException(status_code=401, detail="Нет доступа")


def find_by_email(db: Session, email: str) -> User | None:
    normalized = email.strip().lower()
    if not normalized:
        return None
    return db.query(User).filter(func.lower(User.email) == normalized).first()


def find_by_svyaz_id(db: Session, svyaz_id: str) -> User | None:
    normalized = svyaz_id.strip()
    if not normalized:
        return None
    return db.query(User).filter(User.svyaz_id == normalized).first()


def find_linked_user(db: Session, email: str, svyaz_id: str) -> User | None:
    by_id = find_by_svyaz_id(db, svyaz_id)
    if by_id is not None:
        return by_id
    return find_by_email(db, email)


def bind_svyaz(db: Session, user: User, svyaz_id: str) -> None:
    normalized = svyaz_id.strip()
    if not normalized:
        return
    previous = find_by_svyaz_id(db, normalized)
    if previous is not None and previous.id != user.id:
        previous.svyaz_id = None
    user.svyaz_id = normalized


def apply_profile(user: User, body: SessionBody, fill_name: bool) -> None:
    name = body.name.strip()
    if name and (fill_name or not user.name):
        user.name = name
    city = body.city.strip()
    if city and not user.city:
        user.city = city
    phone = body.phone.strip()
    if phone:
        contacts = [item for item in (user.contacts or []) if isinstance(item, str)]
        if phone not in contacts:
            contacts.append(phone)
            user.contacts = contacts
    if body.avatar_url and not user.avatar_url:
        user.avatar_url = body.avatar_url


def issue_code(db: Session, user: User) -> str:
    code = secrets.token_urlsafe(32)
    db.add(HandoffCode(code=code, user_id=user.id, expires_at=datetime.utcnow() + timedelta(minutes=2)))
    db.commit()
    return code


@router.post("/lookup")
def lookup(body: LookupBody, request: Request, db: Session = Depends(get_db)):
    require_secret(request)
    user = find_linked_user(db, body.email, body.svyaz_id)
    if user is None:
        return {"found": False, "email": ""}
    return {"found": True, "email": user.email}


@router.post("/session")
def session(body: SessionBody, request: Request, db: Session = Depends(get_db)):
    require_secret(request)
    user = find_linked_user(db, body.email, body.svyaz_id)
    if user is None and not body.create:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user is None:
        user = User(
            name=body.name.strip() or body.email,
            email=body.email.strip().lower(),
            hashed_password=hash_unused_password(),
            city=body.city.strip() or None,
            contacts=[body.phone.strip()] if body.phone.strip() else None,
            avatar_url=body.avatar_url,
            role=Role.user,
            svyaz_id=body.svyaz_id.strip() or None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        apply_profile(user, body, fill_name=False)
        bind_svyaz(db, user, body.svyaz_id)
        db.commit()

    return {"code": issue_code(db, user)}


@router.post("/link")
def link(body: LinkBody, request: Request, db: Session = Depends(get_db)):
    require_secret(request)
    email = body.email.strip()
    password = body.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="Укажите почту и пароль")

    from backend.repositories.user_repository import UserRepository

    user = UserRepository(db).authenticate(email, password)
    if user is None:
        user = find_by_email(db, email)
        if user is None or not UserRepository(db).authenticate(user.email, password):
            raise HTTPException(status_code=401, detail="Неверный email или пароль в Потеряшках")
    bind_svyaz(db, user, body.svyaz_id)
    db.commit()
    return {"code": issue_code(db, user)}


@router.post("/consume")
def consume(body: ConsumeBody, response: Response, db: Session = Depends(get_db)):
    code = body.code.strip()
    row = db.query(HandoffCode).filter(HandoffCode.code == code).first()
    if row is None or row.expires_at < datetime.utcnow():
        if row is not None:
            db.delete(row)
            db.commit()
        raise HTTPException(
            status_code=400,
            detail="Ссылка для входа недействительна. Откройте продукт из каталога ещё раз.",
        )

    user = db.query(User).filter(User.id == row.user_id).first()
    if user is None:
        db.delete(row)
        db.commit()
        raise HTTPException(status_code=400, detail="Пользователь Потеряшек не найден")

    access_token = create_access_token({"sub": user.email, "id": user.id})
    refresh_token = create_refresh_token({"sub": user.email, "id": user.id})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
    )
    return {"access_token": access_token, "token_type": "bearer"}


def hash_unused_password() -> str:
    from backend.core.security import hash_password

    return hash_password(secrets.token_urlsafe(24))
