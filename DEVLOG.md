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
- Polished auth UI — dark blue mesh background, frosted glass card, indigo accents
- Both pages fully responsive

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
| `src/pages/Auth.css` | Dark blue mesh auth UI styles |
| `src/App.jsx` | Router setup with protected dashboard route |

---

## Day 4 — 2026-06-07 (Morning) | Dashboard + Task UI + Priority + Due Date

### What I did
- Built full Dashboard page replacing the Day 3 placeholder
- Table-style task list with columns — Task, Priority, Due Date, Status, Actions
- Stats cards — Total, Pending, Completed, Overdue
- Overall progress bar showing completion percentage
- Sidebar navigation — My Tasks, Completed, Overdue with task count badges
- Filter tabs — All, Pending, Done
- Sort dropdown — Newest, Oldest, Priority, Due Date
- Real-time search filtering by title or description
- Add Task modal with title, description, priority and due date fields
- Edit Task — opens modal pre-filled with existing task data
- Delete Task with inline Confirm/Cancel buttons
- One-click status toggle (pending ↔ completed)
- Updated `Task` model — added `priority` (high/medium/low) and `dueDate` fields
- Updated task routes — POST and PUT now handle priority and dueDate
- Overdue tasks highlighted in red in Due Date column
- Color-coded priority badges — High (red), Medium (amber), Low (green)
- Redesigned auth pages to match dashboard dark blue mesh theme
- Cleaned up `index.css` — removed default Vite styles

### Challenges faced
- MongoDB Atlas blocked connection due to IP change — fixed by setting `0.0.0.0/0`
- Backend submodule issue on GitHub — fixed by removing `.git` from backend folder
- Priority and due date not saving — backend POST/PUT routes were missing the new fields

### Files created/updated
| File | Description |
|------|-------------|
| `backend/models/Task.js` | Added priority and dueDate fields |
| `backend/routes/tasks.js` | Updated POST and PUT to handle priority and dueDate |
| `src/pages/Dashboard.jsx` | Full dashboard with all task features |
| `src/pages/Dashboard.css` | Dark blue mesh theme styles |
| `src/pages/Login.jsx` | Redesigned to match dashboard theme |
| `src/pages/Register.jsx` | Redesigned to match dashboard theme |
| `src/pages/Auth.css` | New dark blue mesh background |
| `src/index.css` | Cleaned up Vite defaults |

---

## Day 5 — 2026-06-07 | Gamification + Polish + Submission

### What I did
- Added full gamification system stored in MongoDB
- XP points awarded on task completion — 20 XP for High, 10 XP for Medium, 5 XP for Low priority
- Bonus +5 XP for completing tasks before due date
- Level system — level up every 100 XP, displayed in navbar with XP progress bar
- 6 unlockable badges — First Task 🎯, Getting Started 🚀, Task Master ⭐, Legend 👑, On Fire 🔥, Unstoppable 💎
- Daily streak tracking — streak increments when tasks are completed on consecutive days
- Badges modal — shows all badges, earned ones highlighted, locked ones grayed out
- Confetti animation on task completion
- Toast notifications for all actions — create, edit, delete, XP earned, badge unlocked
- Motivational messages on task completion
- Dark / Light mode toggle — full theme switch using CSS variables, persists via localStorage
- Sidebar progress section — shows total completed, current streak, current level
- New backend endpoints — `GET /api/auth/stats` and `POST /api/auth/award-xp`
- Updated `AuthContext` — added `gameStats`, `awardXP`, `refreshStats`
- Updated README with full feature list, gamification section, corrected setup instructions
- Final commit and push to GitHub

### Challenges faced
- XP and badge state needed to stay in sync between MongoDB and localStorage
- Streak logic required careful date comparison to avoid timezone issues

### Files created/updated
| File | Description |
|------|-------------|
| `backend/models/User.js` | Added xp, level, badges, streak, totalCompleted, lastCompletedDate |
| `backend/routes/auth.js` | Added /stats and /award-xp endpoints, formatUser helper |
| `src/context/AuthContext.jsx` | Added gameStats, awardXP, refreshStats |
| `src/pages/Dashboard.jsx` | Gamification, toasts, confetti, dark/light mode, sort, badges modal |
| `src/pages/Dashboard.css` | CSS variables for full dark/light theme, toast and confetti styles |
| `README.md` | Updated with full features, gamification section, setup instructions |
| `DEVLOG.md` | Complete 5-day log |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Styling | CSS3, Inter & Syne Google Fonts |
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
    │   │   ├── Auth.css
    │   │   └── Dashboard.css
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```