def test_read_root(client):
    """Тест проверки главной страницы"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Главная страница"}

def test_health_check(client):
    """Тест проверки статуса API"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["message"] == "API is working"