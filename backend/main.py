from fastapi import FastAPI
from backend.database import engine, Base
from backend.routes import announcements, auth, user
from fastapi.openapi.utils import get_openapi

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(announcements.router)
app.include_router(auth.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Главная страница"}

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
    
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if method in ["get", "post", "put", "delete"]:
                openapi_schema["paths"][path][method]["security"] = [{"OAuth2PasswordBearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi