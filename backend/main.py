from fastapi import FastAPI
from backend.database import engine, Base, SessionLocal
from backend.routes import announcements, auth, user
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from backend.models import Ad
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="Ad Service API",
    version="1.0.0",
    description="API для объявлений"
)

Base.metadata.create_all(bind=engine)
os.makedirs("media", exist_ok=True)

app.mount("/media", StaticFiles(directory="media"), name="media")

def migrate_contact_data():
    db = SessionLocal()
    try:
        ads = db.query(Ad).all()
        for ad in ads:
            if ad.contact_info and isinstance(ad.contact_info, str):
                ad.contact_info = [ad.contact_info]
        db.commit()
        print("Миграция contact_info завершена")
    except Exception as e:
        print(f"Ошибка миграции: {e}")
        db.rollback()
    finally:
        db.close()


migrate_contact_data()

app.include_router(announcements.router)
app.include_router(auth.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Главная страница"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is working"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Ad Service API",
        version="1.0.0",
        description="API для объявлений",
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi