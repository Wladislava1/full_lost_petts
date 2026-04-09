import pytest

@pytest.fixture
def auth_token(client):
    """Фикстура для получения токена авторизованного пользователя"""
    client.post(
        "/auth/register",
        json={
            "name": "Ad Owner",
            "email": "owner@example.com",
            "password": "password123",
            "password_repeat": "password123"
        }
    )
    response = client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "password123"}
    )
    return response.json()["access_token"]


def test_create_ad(client, auth_token):
    """Тест создания объявления авторизованным пользователем"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    ad_data = {
        "type": "Пропажа",
        "title": "Пропал рыжий кот",
        "city": "Москва",
        "description": "Очень пушистый",
        "animal_name": "Барсик"
    }
    
    response = client.post("/announcements/", json=ad_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Пропал рыжий кот"
    assert data["animal_name"] == "Барсик"
    assert "id" in data

def test_create_ad_unauthorized(client):
    """Тест создания объявления без токена (должна быть ошибка)"""
    ad_data = {
        "type": "Пропажа",
        "title": "Пропал кот",
        "city": "Москва",
        "description": "Пушистый"
    }
    response = client.post("/announcements/", json=ad_data)
    assert response.status_code == 401 # Unauthorized

def test_get_ads_list(client, auth_token):
    """Тест получения списка объявлений"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Создаем два объявления
    client.post("/announcements/", json={
        "type": "Пропажа", "title": "Кот 1", "city": "Мск", "description": "1"
    }, headers=headers)
    
    client.post("/announcements/", json={
        "type": "Находка", "title": "Собака 2", "city": "Спб", "description": "2"
    }, headers=headers)
    
    response = client.get("/announcements/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_get_single_ad(client, auth_token):
    """Тест получения одного объявления по ID"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    create_resp = client.post("/announcements/", json={
        "type": "Пропажа", "title": "Кот для теста ID", "city": "Мск", "description": "тест"
    }, headers=headers)
    
    ad_id = create_resp.json()["id"]
    

    get_resp = client.get(f"/announcements/{ad_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Кот для теста ID"