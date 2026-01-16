# Task Management API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
This API uses JWT (JSON Web Token) authentication. Most endpoints require authentication.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Task Management Endpoints](#task-management-endpoints)
3. [Models & Data Structures](#models--data-structures)
4. [Error Responses](#error-responses)

---

## Authentication Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register/`

**Authentication:** Not required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user_id": 1
}
```

**Validation:**
- `first_name` and `last_name` are required
- Passwords must match
- Password must meet Django's password validation requirements
- Username is auto-generated as `{first_name}_{last_name}`

---

### 2. Login
Authenticate a user and receive JWT tokens.

**Endpoint:** `POST /api/auth/login/`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "John_Doe",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "error": "Invalid credentials"
}
```

---

### 4. List Users
Get a list of all registered users.

**Endpoint:** `GET /api/auth/users/`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "username": "John_Doe",
    "first_name": "John",
    "last_name": "Doe"
  },
  {
    "id": 2,
    "username": "Jane_Smith",
    "first_name": "Jane",
    "last_name": "Smith"
  }
]
```

---

## Task Management Endpoints

### 1. List Tasks
Get a list of all tasks.

**Endpoint:** `GET /api/tasks/`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  [
    {
      "id": 1,
      "title": "Fix login bug",
      "description": "Users cannot login with special characters in password",
      "status": 1,
      "priority": 1,
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z",
      "assigned_to_name": "John_Doe",
      "assigned_to": 1
    }
  ]
}
```

**Status Values:**
- `1`: OPEN
- `2`: ASSIGNED
- `3`: CLOSED
- `4`: DELETED

**Priority Values:**
- `0`: CRITICAL
- `1`: HIGH
- `2`: MEDIUM
- `3`: LOW
- `4`: MINOR

---

### 2. Create Task
Create a new task.

**Endpoint:** `POST /api/tasks/`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Implement new feature",
  "description": "Add dark mode to the application",
  "priority": 2
}
```

**Response:** `201 Created`
```json
{
  "id": 5,
  "title": "Implement new feature",
  "description": "Add dark mode to the application",
  "created_at": "2026-01-16T09:15:00Z",
  "created_by": "John_Doe",
  "assigned_to": null,
  "status": 1,
  "priority": 2,
  "assigned_to_name": null
}
```

**Notes:**
- Task is automatically created with status `OPEN` (1)
- `created_by` is automatically set to the authenticated user
- Default priority is `MINOR` (4) if not specified

---

### 3. Get Task Details
Retrieve details of a specific task.

**Endpoint:** `GET /api/tasks/{id}/`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "created_at": "2026-01-15T10:30:00Z",
  "created_by": "Admin_User",
  "assigned_to": "John_Doe",
  "status": 2,
  "priority": 1,
  "assigned_to_name": "John_Doe",
  "assigned_by": "Admin_User",
  "closed_by": null,
  "deleted_by": null
}
```

---

### 4. Update Task
Update task details (title, description, priority).

**Endpoint:** `PUT /api/tasks/{id}/` or `PATCH /api/tasks/{id}/`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Fix critical login bug",
  "description": "Updated description",
  "priority": 0
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix critical login bug",
  "description": "Updated description",
  "created_at": "2026-01-15T10:30:00Z",
  "created_by": "Admin_User",
  "assigned_to": "John_Doe",
  "status": 2,
  "priority": 0,
  "assigned_to_name": "John_Doe"
}
```

**Notes:**
- Only `title`, `description`, and `priority` can be updated via this endpoint
- Status changes are handled by specific action endpoints

---

### 5. Assign Task
Assign a task to a user.

**Endpoint:** `PATCH /api/tasks/{id}/assign/`

**Authentication:** Required

**Request Body:**
```json
{
  "assigned_to": 2 (user-id)
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "status": 2,
  "priority": 1,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-16T11:00:00Z",
  "assigned_to_name": "Jane_Smith",
  "assigned_to": 2
}
```

**Error Responses:**
- `400 Bad Request`: If task is already closed or deleted
```json
{
  "error": "Cannot assign a closed or deleted task"
}
```

**Notes:**
- Task status automatically changes to `ASSIGNED` (2)
- `assigned_by` is set to the authenticated user
- `assigned_at` timestamp is recorded
- Action is logged in task history

---

### 6. Unassign Task
Remove assignment from a task.

**Endpoint:** `PATCH /api/tasks/{id}/unassign/`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "status": 1,
  "priority": 1,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-16T11:30:00Z",
  "assigned_to_name": null,
  "assigned_to": null
}
```

**Error Responses:**
- `400 Bad Request`: If task is not currently assigned
```json
{
  "error": "Only assigned tasks can be unassigned"
}
```

**Notes:**
- Task status changes back to `OPEN` (1)
- Assignment fields (`assigned_to`, `assigned_by`, `assigned_at`) are cleared
- Action is logged in task history

---

### 7. Close Task
Mark a task as completed.

**Endpoint:** `PATCH /api/tasks/{id}/close/`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "status": 3,
  "priority": 1,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-16T14:00:00Z",
  "assigned_to_name": "John_Doe",
  "assigned_to": 1
}
```

**Error Responses:**
- `400 Bad Request`: If task is not currently assigned
```json
{
  "error": "Only assigned tasks can be closed"
}
```

**Notes:**
- Only tasks with status `ASSIGNED` (2) can be closed
- Task status changes to `CLOSED` (3)
- `closed_by` is set to the authenticated user
- `closed_at` timestamp is recorded
- Action is logged in task history

---

### 8. Delete Task
Soft delete a task.

**Endpoint:** `PATCH /api/tasks/{id}/delete_task/`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters in password",
  "status": 4,
  "priority": 1,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-16T15:00:00Z",
  "assigned_to_name": "John_Doe",
  "assigned_to": 1
}
```

**Error Responses:**
- `400 Bad Request`: If task is already deleted
```json
{
  "error": "Task is already deleted"
}
```

**Notes:**
- This is a soft delete (task is not removed from database)
- Task status changes to `DELETED` (4)
- `deleted_by` is set to the authenticated user
- `deleted_at` timestamp is recorded
- Action is logged in task history

---

### 9. Add Comment
Add a comment to a task.

**Endpoint:** `POST /api/tasks/{id}/comment/`

**Authentication:** Required

**Request Body:**
```json
{
  "comment": "I've started working on this task"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "task": 1,
  "commented_at": "2026-01-16T10:30:00Z",
  "commented_by": "John_Doe",
  "comment": "I've started working on this task"
}
```

**Notes:**
- `commented_by` is automatically set to the authenticated user
- `commented_at` timestamp is automatically recorded

---

### 10. Get Task History
Retrieve the complete history of changes for a task.

**Endpoint:** `GET /api/tasks/{id}/history/`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "task": 1,
    "changed_at": "2026-01-16T11:00:00Z",
    "changed_by": "Admin_User",
    "assigned_to": "John_Doe",
    "previous_status": 1,
    "new_status": 2
  },
  {
    "id": 2,
    "task": 1,
    "changed_at": "2026-01-16T14:00:00Z",
    "changed_by": "John_Doe",
    "assigned_to": null,
    "previous_status": 2,
    "new_status": 3
  }
]
```

**Notes:**
- Returns all historical changes in chronological order
- Includes status changes, assignments, and who made each change

---

### 11. Get Task Comments
Retrieve all comments for a task.

**Endpoint:** `GET /api/tasks/{id}/comments/`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "task": 1,
    "commented_at": "2026-01-16T10:30:00Z",
    "commented_by": "John_Doe",
    "comment": "I've started working on this task"
  },
  {
    "id": 2,
    "task": 1,
    "commented_at": "2026-01-16T12:45:00Z",
    "commented_by": "Admin_User",
    "comment": "Great progress!"
  }
]
```

---


