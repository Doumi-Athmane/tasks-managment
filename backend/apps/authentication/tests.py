import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
User = get_user_model()


@pytest.mark.django_db
def test_login():
    user = User.objects.create_user(username="testuser", password="testpass123")

    client = APIClient()
    res = client.post("/api/auth/login/", data={
        "username": "testuser",
        "password": "testpass123"
    })
    assert res.status_code == 200
    assert res.data['access'] is not None

@pytest.mark.django_db
def test_register():
    client = APIClient()

    res = client.post("/api/auth/register/", data={
        "first_name": "newuser",
        "last_name": "testuser",
        "password": "newpass123",
        "password_confirm": "newpass123"
    })
    assert res.status_code == 201

    res = client.post("/api/auth/login/", data={
        "username": "newuser_testuser",
        "password": "newpass123"
    })
    assert res.status_code == 200