# Task Manager API

A secure Task Management REST API built with Node.js, Express.js, MongoDB Atlas, and JWT Authentication.

This project was developed as part of the MERN Stack Internship Assignment for AvQuint Solutions Pvt Ltd.

---

## Features

### Authentication
- User Registration
- User Login
- JWT-based Authentication
- Password Hashing using bcryptjs
- Protected Routes

### Task Management
- Create Task
- Get All Tasks
- Get Single Task
- Update Task
- Delete Task
- Toggle Task Status (Pending ↔ Completed)

### Filtering & Search
- Filter tasks by status
- Search tasks by keyword

### Security
- JWT Authentication Middleware
- User-Scoped Data Access
- Password Hashing
- Protected CRUD Operations

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| Environment Variables | dotenv |
| Development | nodemon |

---

## Project Structure

```text
backend/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── auth.js
│   └── tasks.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/khmkdh/task-manager.git
cd task-manager
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Run Development Server

```bash
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

---

#### Login User

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "JWT_TOKEN"
}
```

---

## Task Routes

All task routes require:

```http
Authorization: Bearer <token>
```

---

### Create Task

```http
POST /api/tasks
```

Request:

```json
{
  "title": "Complete Assignment",
  "description": "Finish MERN internship task"
}
```

---

### Get All Tasks

```http
GET /api/tasks
```

Optional Query Parameters:

```http
/api/tasks?status=pending
/api/tasks?status=completed
/api/tasks?search=assignment
```

---

### Get Single Task

```http
GET /api/tasks/:id
```

---

### Update Task

```http
PUT /api/tasks/:id
```

Request:

```json
{
  "title": "Updated Task",
  "description": "Updated Description",
  "status": "completed"
}
```

---

### Toggle Status

```http
PATCH /api/tasks/:id/toggle
```

---

### Delete Task

```http
DELETE /api/tasks/:id
```

---

## Security Features

- Passwords hashed using bcryptjs
- JWT Token Authentication
- Protected API Routes
- User-specific Task Access
- Input Validation
- Environment Variable Protection

---

## Future Enhancements

- React Frontend (Vite)
- Dashboard UI
- Task Categories
- Due Dates
- Pagination
- Profile Management
- Dark Mode
- Deployment

---

## Developer

**Khyati**

GitHub: https://github.com/khmkdh

---

## License

This project is developed for educational and internship evaluation purposes.