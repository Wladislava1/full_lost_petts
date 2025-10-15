from fastapi import FastAPI, Depends
from backend.routes import announcements, auth, user
from backend.database import engine, Base, get_db
from backend import models
from sqlalchemy.orm import Session
from backend.core.utils import check_db_connection

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Главная страница"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return check_db_connection(db)

@app.get("/ads")
def get_ads(db: Session = Depends(get_db)):
    ads = db.query(models.Ad).all()
    return ads

app.include_router(announcements.router)
app.include_router(auth.router)
app.include_router(user.router)
