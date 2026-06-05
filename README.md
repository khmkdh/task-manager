# Task Manager

A full-stack Task Management application built with the MERN stack — React frontend with JWT-protected Node.js/Express backend and MongoDB Atlas database.

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
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Environment Variables | dotenv |
| Development | nodemon, VS Code |

---

## Project Structure

```text
task-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Auth.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/khmkdh/task-manager.git
cd task-manager
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

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

### Create Task

```http
POST /api/tasks
```

### Get All Tasks

```http
GET /api/tasks
```

Optional query parameters:

```http
/api/tasks?status=pending
/api/tasks?status=completed
/api/tasks?search=keyword
```

### Get Single Task

```http
GET /api/tasks/:id
```

### Update Task

```http
PUT /api/tasks/:id
```

### Toggle Status

```http
PATCH /api/tasks/:id/toggle
```

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

- Dashboard UI completion
- Task Categories
- Due Dates
- Pagination
- Profile Management
- Deployment

---

## Developer

**Khyati**

GitHub: https://github.com/khmkdh

---

## License

This project is developed for educational and internship evaluation purposes.