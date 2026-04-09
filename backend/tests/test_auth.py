import pytest

def test_register_user(client):
    """Тест успешной регистрации"""
    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "password_repeat": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["name"] == "Test User"

def test_register_user_password_mismatch(client):
    """Тест регистрации с несовпадающими паролями"""
    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": "test2@example.com",
            "password": "password123",
            "password_repeat": "wrongpassword"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Passwords do not match"

def test_login_user(client):
    """Тест успешного логина"""
    client.post(
        "/auth/register",
        json={
            "name": "Login User",
            "email": "login@example.com",
            "password": "password123",
            "password_repeat": "password123"
        }
    )
    
    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client):
    """Тест логина с неверным паролем"""
    client.post(
        "/auth/register",
        json={
            "name": "Wrong User",
            "email": "wrong@example.com",
            "password": "password123",
            "password_repeat": "password123"
        }
    )
    
    response = client.post(
        "/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"