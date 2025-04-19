## Getting Started

Follow these steps to set up and run the application locally on `3000` port:

1. Clone the repository

   ```
   git clone https://github.com/mdayat/fe_isi_test_muhammadnurhidayat
   cd fe_isi_test_muhammadnurhidayat
   ```

2. Start the application using Docker Compose

   ```
   docker compose up -d
   ```

> **Note:** This application uses user ID as the login mechanism. You can find the list of available user IDs in the `/prisma/seed.ts` file.

## Completed Requirements

- [x] Login system that returns JWT (access token) stored in cookies
- [x] Lead can create, update, and delete tasks
- [x] Lead can assign or reassign a task to a team
- [x] Both Lead and Team can view audit logs
- [x] Team can only update task `description` and `status`
- [x] Application can be run with Docker Compose
- [x] Structured logging implemented with Pino

## API Specifications

This section documents the REST API endpoints available in the application.

### Authentication

#### `POST /api/auth/login`

**Description**: Authenticates a user and returns a JWT token stored in cookies.

**Access Control**: Public

**Request Body**:

```typescript
{
  id: string;
}
```

**Responses**:

- `200 OK`: Successfully authenticated
  ```typescript
  {
    id: string;
    name: string;
    created_at: string;
    role: "lead" | "team";
  }
  ```
- `400 Bad Request`: Invalid request body
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

#### `POST /api/auth/logout`

**Description**: Logs out the current user by invalidating their token.

**Access Control**: Public

**Request Body**: None

**Responses**:

- `200 OK`: Successfully logged out
- `500 Internal Server Error`: Server error

### User Management

#### `GET /api/users/me`

**Description**: Retrieves the current user's information.

**Access Control**: Authenticated Users (Lead, Team)

**Request Body**: None

**Responses**:

- `200 OK`: Returns current user info
  ```typescript
  {
    id: string;
    name: string;
    created_at: string;
    role: "lead" | "team";
  }
  ```
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Team Management

#### `GET /api/teams`

**Description**: Retrieves all teams.

**Access Control**: Lead only

**Request Body**: None

**Responses**:

- `200 OK`: Returns list of teams

  ```typescript
  [
    {
      id: string;
      name: string;
      created_at: string;
      role: "lead" | "team";
    }
  ]
  ```

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `500 Internal Server Error`: Server error

### Task Management

#### `GET /api/tasks`

**Description**: Retrieves all tasks.

**Access Control**: Authenticated Users (Lead, Team)

**Responses**:

- `200 OK`: Returns list of tasks

  ```typescript
  [
    {
      id: string;
      name: string;
      status: "not_started" | "on_progress" | "done" | "reject";
      created_at: string;
      description: string | null;
      updated_at: string;
      team: {
        id: string;
        name: string;
        created_at: string;
        role: "lead" | "team";
      } | null;
    }
  ]
  ```

- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### `POST /api/tasks`

**Description**: Creates a new task.

**Access Control**: Lead only

**Request Body**:

```typescript
{
  name: string;
  status: "not_started" | "on_progress" | "done" | "reject";
  description?: string;
  team_id?: string;
}
```

**Responses**:

- `201 OK`: Task created successfully
  ```typescript
  {
    id: string;
    name: string;
    status: "not_started" | "on_progress" | "done" | "reject";
    created_at: string;
    description: string | null;
    updated_at: string;
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `500 Internal Server Error`: Server error

#### `GET /api/tasks/{taskId}`

**Description**: Retrieves a specific task by ID.

**Access Control**: Authenticated Users (Lead, Team)

**Path Parameters**:

- `taskId`: string (uuid) - The ID of the task to retrieve

**Responses**:

- `200 OK`: Returns task details
  ```typescript
  {
    id: string;
    name: string;
    description: string | null;
    status: "not_started" | "on_progress" | "done" | "reject";
    created_at: string;
    updated_at: string;
    audit_logs: [
      {
        id: string;
        user: UserDTO;
        action: AuditAction;
        changes: string;
        created_at: string;
      }
    ]
  }
  ```
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

#### `PUT /api/tasks/{taskId}`

**Description**: Updates a specific task by ID.

**Access Control**: Authenticated Users (Lead, Team)

**Path Parameters**:

- `taskId`: string (uuid) - The ID of the task to update

**Request Body**:

```typescript
{
  team_id?: {
    old_value: string | null;
    new_value: string | null;
  };

  name?: {
    old_value: string;
    new_value: string;
  };

  description?: {
    old_value: string | null;
    new_value: string | null;
  };

  status?: {
    old_value: "not_started" | "on_progress" | "done" | "reject";
    new_value: "not_started" | "on_progress" | "done" | "reject";
  };
}
```

**Responses**:

- `200 OK`: Task updated successfully
  ```typescript
  {
    id: string;
    name: string;
    status: "not_started" | "on_progress" | "done" | "reject";
    created_at: string;
    description: string | null;
    updated_at: string;
  }
  ```
- `204 No Content`: No update performed
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

#### `DELETE /api/tasks/{taskId}`

**Description**: Deletes a specific task by ID.

**Access Control**: Lead only

**Path Parameters**:

- `taskId`: string (uuid) - The ID of the task to delete

**Responses**:

- `204 OK`: Task deleted successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error
