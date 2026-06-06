# Task Manager — Internship Devlog

> MERN Stack Internship Assignment | AvQuint Solutions Pvt Ltd
> Developer: Khyati | Start Date: 2026-06-04

---

## Day 1 — 2026-06-04 (Evening) | Project Setup + Backend Auth

### What I did
- Initialized the Node.js backend project from scratch
- Set up Express server with CORS and JSON middleware
- Connected MongoDB Atlas (M0 free cluster) using Mongoose
- Created `User` model with name, email, hashed password and timestamps
- Created `Task` model with title, description, status (pending/completed), userId reference
- Built JWT authentication middleware (`protect`) to guard private routes
- Implemented `/api/auth/register` — hashes password with bcryptjs, returns JWT
- Implemented `/api/auth/login` — validates credentials, returns JWT
- Added placeholder for `/api/tasks` route (protected, returns user info)
- Fixed nodemon typo in package.json scripts (`nodeman` → `nodemon`)
- Successfully connected MongoDB Atlas cluster

### Challenges faced
- Got stuck on MongoDB Atlas setup — had to reset database user password
- Nodemon not installing correctly at first (typo in package.json scripts)
- IP whitelist needed to be set to `0.0.0.0/0` for development access

### Endpoints ready
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/tasks` | Yes | Placeholder — returns user info |

---

## Day 2 — 2026-06-04 (Night) | Task CRUD APIs + Protected Routes

### What I did
- Replaced placeholder tasks route with full CRUD implementation
- All task routes protected with `protect` middleware (JWT required)
- Implemented GET `/api/tasks` — fetches all tasks for logged-in user, sorted by newest first
- Added query param support: `?status=pending`, `?status=completed`, `?search=keyword`
- Implemented GET `/api/tasks/:id` — fetch single task (user-scoped)
- Implemented POST `/api/tasks` — create task with title + optional description
- Implemented PUT `/api/tasks/:id` — update title, description, or status
- Implemented PATCH `/api/tasks/:id/toggle` — toggle status between pending ↔ completed
- Implemented DELETE `/api/tasks/:id` — delete task (user-scoped, can't delete others' tasks)
- All operations are user-scoped — users can only access their own tasks

### Security implemented
- Every task query filters by `userId: req.user.id` — prevents cross-user data access
- JWT verified on every protected route before any DB operation
- Invalid/expired tokens return 401 immediately

### Endpoints ready
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tasks` | Yes | Get all tasks (filter by status/search) |
| GET | `/api/tasks/:id` | Yes | Get single task |
| POST | `/api/tasks` | Yes | Create new task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| PATCH | `/api/tasks/:id/toggle` | Yes | Toggle pending ↔ completed |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

---

## Day 3 — 2026-06-06 | React Frontend + Auth Pages

### What I did
- Initialized React 18 app with Vite in `/frontend`
- Installed `react-router-dom` and `axios`
- Set up React Router v6 with `BrowserRouter`, `Routes`, `Route`
- Built `AuthContext` with `login`, `register`, `logout` — JWT and user stored in `localStorage`
- Created Axios instance (`/api/axios.js`) with base URL and JWT auth header interceptor
- Built `ProtectedRoute` component — redirects to `/login` if no user in context
- Built Login page with email/password form validation and error handling
- Built Register page with name/email/password form, min-length password validation
- Polished auth UI — dark split-panel layout with grid texture, glowing orbs, monospace accents
- Both pages are fully responsive (stack on mobile)

### Challenges faced
- `frontend/` folder had no `package.json` — had to run `npm create vite@latest . -- --template react` inside it and choose "Ignore files and continue"
- Port 5173 was already in use — Vite auto-switched to 5174

### Files created
| File | Description |
|------|-------------|
| `src/context/AuthContext.jsx` | Auth state, login/register/logout functions |
| `src/api/axios.js` | Axios instance with JWT interceptor |
| `src/components/ProtectedRoute.jsx` | Route guard — redirects unauthenticated users |
| `src/pages/Login.jsx` | Login page with form validation |
| `src/pages/Register.jsx` | Register page with form validation |
| `src/pages/Dashboard.jsx` | Placeholder — full build Day 4 |
| `src/pages/Auth.css` | Dark split-panel auth UI styles |
| `src/App.jsx` | Router setup with protected dashboard route |

---

## Day 4 — 2026-06-07 | Dashboard UI + Task Management

### What I did
- Built full Dashboard page replacing the Day 3 placeholder
- Implemented task list with pending/completed filter tabs
- Connected Dashboard to backend `/api/tasks` via Axios with JWT header
- Added task creation form/modal — POST to `/api/tasks`
- Added inline edit functionality — PUT to `/api/tasks/:id`
- Added one-click status toggle — PATCH to `/api/tasks/:id/toggle`
- Added delete task with confirmation — DELETE to `/api/tasks/:id`
- Added search bar to filter tasks by keyword
- Updated `backend/models/Task.js` and `backend/routes/tasks.js` (bug fixes / field updates)
- Polished Dashboard CSS to match dark auth UI aesthetic
- Updated `frontend/src/index.css` for global consistency

### Files modified
| File | Description |
|------|-------------|
| `frontend/src/pages/Dashboard.jsx` | Full task management UI |
| `frontend/src/pages/Dashboard.css` | Dashboard styles |
| `frontend/src/index.css` | Global style updates |
| `backend/models/Task.js` | Model updates |
| `backend/routes/tasks.js` | Route fixes |

---

## Day 5 — (Upcoming) | Polish + GitHub + Submission

### Plan
- Responsive design fixes
- Loading states and error messages
- Final README with setup instructions and screenshots
- Clean up code and comments
- Push final version to GitHub
- Prepare submission email

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Dev Tools | nodemon, VS Code, Postman |

---

## Project Structure

```
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
│   ├── .env          (not committed)
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