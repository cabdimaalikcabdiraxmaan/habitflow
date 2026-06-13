# HabitFlow

A full-stack habit tracker built for real daily use and portfolio demos. Track habits, mark daily progress, view calendar history, and manage your account.

**Live demo:** _Add your deployed URL here_  
**GitHub:** _Add your repository URL here_

<!-- Add a screenshot: docs/screenshots/dashboard.png -->

---

## Features

- **Authentication** — Register, login, JWT sessions, password change, account deletion
- **Habit dashboard** — Mark habits complete for today with a clean row layout
- **Manage habits** — Create, edit, and delete habits with category, frequency, and targets
- **Goal progress** — Track completion count toward a target (e.g. `12 / 30 days`)
- **Streaks** — Per-habit streak on the details page; overall streak in statistics
- **Calendar** — See which habits were completed on each day
- **Statistics** — Daily completion, weekly rate, category breakdown, recent activity
- **Account settings** — Profile, password, reminders preference

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Node.js, Express, JWT, bcrypt, Zod |
| Database | PostgreSQL, Prisma ORM |
| Security | Helmet, CORS, rate limiting, protected routes |

---

## Project structure

```
Habbit Tracker/
├── habbit/          # React frontend (Vite)
├── backend/         # Express API + Prisma
└── README.md
```

---

## Run locally

### Prerequisites

- Node.js 18+
- PostgreSQL

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

API runs at **http://localhost:7001**

### 2. Frontend

```bash
cd habbit
cp .env.example .env

npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `PORT` | API port (default `7001`) |

### Frontend (`habbit/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default `http://localhost:7001`) |

---

## Deploy (portfolio)

**Full step-by-step guide:** see [DEPLOY.md](./DEPLOY.md)

Quick summary:
- **Backend + DB:** Render (uses `render.yaml` in repo root)
- **Frontend:** Vercel (root directory: `habbit/`)

After deploy, set `VITE_API_URL` on Vercel to your Render API URL.

---

## API overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/habits` | List habits |
| POST | `/api/habits/:id/logs` | Mark habit complete for a date |
| GET | `/api/stats` | Dashboard statistics |
| GET/PUT/DELETE | `/api/profile` | Profile & account |

All habit/profile routes require `Authorization: Bearer <token>`.

---

## What I learned

- Designing a JWT auth flow with protected React routes and context providers
- Modeling habit completion as date-based logs for calendar and streak features
- Building a consistent dashboard UI with nested routing and shared layout
- Debugging React context scope with nested `Outlet` routes

---

## License

MIT — free to use for learning and portfolio purposes.
