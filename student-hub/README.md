# Student Hub

A full-stack academic collaboration platform built with **React** (Vite) and **Node.js/Express**. Student Hub lets students browse and enroll in courses, share study resources (with file uploads), and plan their academic deadlines — all behind JWT-based authentication.

## Features

- **Authentication** — secure registration/login with bcrypt password hashing and JWT sessions
- **Course Access** — browse a course catalog and enroll; view "My Courses"
- **Resource Sharing** — upload/download study materials per course, with file-type and size validation
- **Academic Planner** — create, complete, and delete tasks/deadlines with priority levels, optionally linked to a course
- **Protected routes** on both the API (middleware) and the frontend (route guards)

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, React Router, Axios, Vite |
| Backend  | Node.js, Express |
| Auth     | JWT, bcryptjs |
| Storage  | lowdb (file-based JSON DB) + local file storage for uploads — swappable for MongoDB/S3 |
| File uploads | Multer |

> **Why lowdb instead of MongoDB?** It keeps the project runnable anywhere with zero external services for demos and grading. The data layer is isolated in `backend/data/db.js` and the route files, so swapping in MongoDB/Mongoose later is a contained change — see "Going to production" below.

## Project Structure

```
student-hub/
├── backend/
│   ├── data/          # db.js (lowdb setup), seed.js (sample data)
│   ├── middleware/     # auth.js (JWT verification)
│   ├── routes/        # auth, courses, resources, planner
│   ├── uploads/        # uploaded files (created at runtime)
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/         # axios client
    │   ├── components/  # Navbar, ProtectedRoute
    │   ├── context/     # AuthContext
    │   ├── pages/       # Home, Login, Register, Courses, Resources, Planner
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET if you like
npm run seed            # creates sample courses + a demo user
npm run dev              # starts API on http://localhost:5000
```

Demo login (after seeding): `demo@studenthub.com` / `Password123!`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # starts React app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so just open `http://localhost:5173`.

## API Overview

| Method | Endpoint                  | Auth | Description |
|--------|----------------------------|------|--------------|
| POST   | /api/auth/register         | No   | Create an account |
| POST   | /api/auth/login            | No   | Log in, returns JWT |
| GET    | /api/auth/me               | Yes  | Current user profile |
| GET    | /api/courses               | No   | List all courses |
| GET    | /api/courses/:id           | No   | Get one course |
| POST   | /api/courses/:id/enroll    | Yes  | Enroll in a course |
| GET    | /api/courses/mine/list     | Yes  | Courses you're enrolled in |
| GET    | /api/resources             | No   | List resources (optional `?courseId=`) |
| POST   | /api/resources             | Yes  | Upload a resource (multipart/form-data) |
| GET    | /api/resources/:id/download| No   | Download a file |
| DELETE | /api/resources/:id         | Yes  | Delete your own resource |
| GET    | /api/planner                | Yes  | Your tasks |
| POST   | /api/planner                | Yes  | Create a task |
| PATCH  | /api/planner/:id            | Yes  | Update/complete a task |
| DELETE | /api/planner/:id            | Yes  | Delete a task |

## Going to Production

- Swap `lowdb` for MongoDB (Mongoose) or PostgreSQL — only `backend/data/db.js` and the model-access lines in each route need to change
- Move file uploads to S3/Cloud Storage instead of local disk
- Add refresh tokens / shorter-lived access tokens
- Add input validation (e.g., `zod` or `joi`) on all request bodies
- Deploy backend (Render/Railway/EC2) and frontend (Vercel/Netlify); set `VITE_API_URL` and CORS origin accordingly

## Resume Bullet Points

- Architected and built a full-stack academic platform (React, Node.js, Express) enabling resource sharing, course enrollment, and deadline planning for students
- Implemented JWT-based authentication with bcrypt password hashing and protected REST API routes
- Designed a file-upload system (Multer) with type/size validation for secure resource sharing scoped to individual courses
- Built a responsive React SPA with React Router, context-based auth state, and reusable UI components
- Owned the full development lifecycle solo — architecture, API design, database modeling, and UI implementation
