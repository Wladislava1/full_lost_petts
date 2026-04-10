import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
from backend.main import app
from backend.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()

# Добавьте эти фикстуры:

@pytest.fixture(scope="function")
def auth_token():
    """Фикстура для тестового токена"""
    return "test-token-for-auth"

@pytest.fixture(scope="function", autouse=True)
def mock_auth():
    """Автоматический мок для аутентификации во всех тестах"""
    with patch('backend.routes.announcements.get_current_user') as mock_announcements:
        mock_announcements.return_value = {"id": 1, "email": "owner@example.com", "name": "Test Owner"}
        
        with patch('backend.routes.auth.get_current_user') as mock_auth:
            mock_auth.return_value = {"id": 1, "email": "owner@example.com", "name": "Test Owner"}
            
            with patch('backend.routes.user.get_current_user') as mock_user:
                mock_user.return_value = {"id": 1, "email": "owner@example.com", "name": "Test Owner"}
                
                yield

@pytest.fixture(scope="function")
def test_user():
    """Фикстура с данными тестового пользователя"""
    return {
        "id": 1,
        "email": "owner@example.com",
        "name": "Test Owner"
    }