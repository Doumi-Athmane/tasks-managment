import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import Task

@pytest.mark.django_db
def test_list_tasks_requires_auth():
    client = APIClient()
    res = client.get("/api/tasks/")
    assert res.status_code in (401, 403)

@pytest.mark.django_db
def test_list_tasks():
    user = User.objects.create_user(username="u1", password="pass1234")

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    res = client.get("/api/tasks/")
    assert res.status_code == 200

@pytest.mark.django_db
def test_create_task():
    user = User.objects.create_user(username="u2", password="pass1234")

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    res = client.post("/api/tasks/", data={"title": "New Task", "description": "Task description", "priority": 2})
    assert res.status_code == 201
    assert res.data["title"] == "New Task"
    assert res.data["description"] == "Task description"
    assert res.data["priority"] == 2

@pytest.mark.django_db
def test_create_task_without_title():
    user = User.objects.create_user(username="u3", password="pass1234") 
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    res = client.post("/api/tasks/", data={"description": "Task description", "priority": 2})
    assert res.status_code == 400

@pytest.mark.django_db
def test_assign_task():
    user1 = User.objects.create_user(username="u4", password="pass1234")
    user2 = User.objects.create_user(username="u5", password="pass1234")
    refresh = RefreshToken.for_user(user1)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to assign", description="Task description", priority=3, created_by=user1)
    task_id = task_res.id
    assign_res = client.patch(f"/api/tasks/{task_id}/assign/", data={"assigned_to": user2.id})
    assert assign_res.status_code == 200
    assert assign_res.data["assigned_to"] == user2.id

@pytest.mark.django_db
def test_unassign_task():
    user = User.objects.create_user(username="u6", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to unassign", description="Task description", priority=1, assigned_to=user, created_by=user)
    task_res.status = Task.Status.ASSIGNED
    task_res.assigned_to = user
    task_res.save()
    task_id = task_res.id
    unassign_res = client.patch(f"/api/tasks/{task_id}/unassign/")
    assert unassign_res.status_code == 200
    assert unassign_res.data["assigned_to"] is None

@pytest.mark.django_db
def test_unassign_closed_task():
    user = User.objects.create_user(username="u6", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to unassign", description="Task description", priority=1, assigned_to=user, created_by=user)
    task_res.status = Task.Status.CLOSED
    task_res.assigned_to = user
    task_res.save()
    task_id = task_res.id
    unassign_res = client.patch(f"/api/tasks/{task_id}/unassign/")
    assert unassign_res.status_code == 400

@pytest.mark.django_db
def test_delete_task():
    user = User.objects.create_user(username="u7", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to delete", description="Task description", priority=2, created_by=user)
    task_id = task_res.id
    delete_res = client.delete(f"/api/tasks/{task_id}/")
    assert delete_res.status_code == 204
    get_res = client.get(f"/api/tasks/{task_id}/")
    assert get_res.status_code == 404

@pytest.mark.django_db
def test_update_task():
    user = User.objects.create_user(username="u8", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to update", description="Task description", priority=3, created_by=user)
    task_id = task_res.id
    update_res = client.put(f"/api/tasks/{task_id}/", data={"title": "Updated Task", "description": "Updated description", "priority": 1})
    assert update_res.status_code == 200
    assert update_res.data["title"] == "Updated Task"
    assert update_res.data["description"] == "Updated description"
    assert update_res.data["priority"] == 1

@pytest.mark.django_db
def test_close_task():
    user = User.objects.create_user(username="u9", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to close", description="Task description", priority=2, created_by=user)
    task_res.status = Task.Status.ASSIGNED
    task_res.assigned_to = user
    task_res.save()
    task_id = task_res.id
    close_res = client.patch(f"/api/tasks/{task_id}/close/")
    assert close_res.status_code == 200
    assert close_res.data["status"] == Task.Status.CLOSED

@pytest.mark.django_db
def test_close_opened_task():
    user = User.objects.create_user(username="u9", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task to close", description="Task description", priority=2, created_by=user)
    task_res.save()
    task_id = task_res.id
    close_res = client.patch(f"/api/tasks/{task_id}/close/")
    assert close_res.status_code == 400

@pytest.mark.django_db
def test_create_comment():
    user = User.objects.create_user(username="u10", password="pass1234")
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    task_res = Task.objects.create(title="Task for comment", description="Task description", priority=2, created_by=user)
    task_id = task_res.id
    comment_res = client.post(f"/api/tasks/{task_id}/comment/", data={"comment": "This is a comment."}, format='json')
    assert comment_res.status_code == 201
    assert comment_res.data["comment"] == "This is a comment."
    assert comment_res.data["commented_by"] == user.username