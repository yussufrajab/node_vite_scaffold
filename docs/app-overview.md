# postgrestest — Application Overview

A full-stack authentication & admin dashboard scaffold built as a monorepo.

---

## Technologies

| Layer | Technologies |
|-------|-------------|
| **Runtime** | Node.js |
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 3.4, React Router 7 |
| **Backend** | Express 5, TypeScript, Socket.IO 4 |
| **Auth** | jose (JWT), bcryptjs, Passport (OAuth2 strategy installed) |
| **State** | Zustand (client), React Hook Form + Zod (forms) |
| **UI** | Radix UI primitives (Avatar, Dialog, Dropdown, Select, Label, Slot), TanStack Table, Recharts, Lucide icons, class-variance-authority + tailwind-merge |
| **Queues** | Bull (Redis-backed job queue) |
| **Real-time** | Socket.IO (server + client) |
| **HTTP** | Axios (client), CORS |
| **Build** | TypeScript 6, Vite 8, PostCSS, concurrently |
| **Linting** | ESLint 10, typescript-eslint |

---

## Database

**No database is configured.** The app currently uses **in-memory storage**:

- `auth.service.ts` — `users: UserRecord[]` array and `refreshTokens: Set<string>` in memory
- Comment in code: `// In-memory store — swap with a real DB in production`
- Bull queue is configured to connect to Redis (for job scheduling), but the cleanup job clears the in-memory set, not a DB

---

## Configuration (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment |
| `JWT_SECRET` | `change-me-to-a-random-secret` | JWT signing key |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |

---

## User Roles & Credentials

**No seed users exist.** Users are created at runtime via the register endpoint and exist only in memory. There is no way to initially create an admin user through the app — registration always assigns `role: 'user'`.

| Role | How to obtain |
|------|---------------|
| `user` | Register via `/api/auth/register` or `/register` page |
| `admin` | Only possible by modifying the in-memory array manually or adding a seed script |

---

## Login Methods

1. **Email + Password** (primary) — POST `/api/auth/login` with `{ email, password }`, returns `{ accessToken, refreshToken }`
2. **Token Refresh** — POST `/api/auth/refresh` with `{ refreshToken }` returns new token pair (rotates)
3. **Passport OAuth2** strategy is installed (`passport-oauth2`) but **not wired up** in routes
4. **Logout** — POST `/api/auth/logout` (authenticated) invalidates the refresh token

---

## Role Permissions Matrix

| Endpoint | Method | Auth Required | Admin Required |
|----------|--------|---------------|----------------|
| `/api/auth/register` | POST | No | No |
| `/api/auth/login` | POST | No | No |
| `/api/auth/refresh` | POST | No | No |
| `/api/auth/logout` | POST | Yes | No |
| `/api/auth/me` | GET | Yes | No |
| `/api/users` | GET | Yes | **Yes** |
| `/api/users/:id` | GET | Yes | No |

**Client-side route protection:**

- `/dashboard` — any authenticated user
- `/admin/*` — authenticated user with `role === 'admin'`
- `/login`, `/register` — public (no redirect)

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Logout (invalidate refresh token) |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/users` | Paginated user list (admin only) |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/health` | Health check |

---

## Database Schema (Logical — In-Memory)

**UserRecord:**

| Field | Type |
|-------|------|
| `id` | string (UUID v4) |
| `name` | string |
| `email` | string (unique) |
| `password` | string (bcrypt hash, cost 12) |
| `role` | `'user' \| 'admin'` |
| `createdAt` | string (ISO 8601) |
| `updatedAt` | string (ISO 8601) |

**Refresh Token Store:** `Set<string>` of UUID v4 tokens.

**API Response Envelope:**

```ts
{ data: T, meta?: { page, limit, total } }  // success
{ error: string, code?: string }              // error
```

---

## Project Structure

```
postgrestest/
├── package.json                  # Root monorepo (npm workspaces)
├── shared/                       # Shared types package
│   ├── types/
│   │   ├── auth.ts               # LoginRequest, RegisterRequest, AuthTokens, AuthResponse
│   │   ├── user.ts               # UserDto, UserRole, CreateUserRequest, UpdateUserRequest
│   │   └── api.ts                # ApiResponse, ApiError
│   └── tsconfig.json
├── server/                       # Express backend
│   ├── .env.example
│   ├── src/
│   │   ├── index.ts              # App entry — Express + Socket.IO + CORS
│   │   ├── config/index.ts       # Env config reader
│   │   ├── routes/
│   │   │   ├── auth.routes.ts    # Auth endpoints
│   │   │   └── users.routes.ts   # User management endpoints
│   │   ├── services/
│   │   │   ├── auth.service.ts   # Register, login, refresh, logout, in-memory store
│   │   │   └── user.service.ts   # listUsers (paginated), getProfile
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # authenticate (JWT verify), requireAdmin
│   │   │   └── error.middleware.ts # AppError class + error handler
│   │   ├── socket/index.ts       # Socket.IO setup (ping/pong)
│   │   └── jobs/
│   │       ├── index.ts
│   │       └── cleanup.job.ts    # Bull queue — clears expired refresh tokens hourly
│   └── tsconfig.json
├── client/                       # React frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── index.css
│       ├── router/index.tsx              # Routes + ProtectedRoute/AdminRoute guards
│       ├── stores/auth-store.ts          # Zustand — user, tokens, isAuthenticated
│       ├── hooks/useAuth.ts              # useAuth hook — login/register/logout
│       ├── lib/
│       │   ├── api.ts                    # Axios instance with interceptors (Bearer token, auto-refresh)
│       │   └── utils.ts
│       ├── components/ui/                # Radix + Tailwind UI primitives
│       │   ├── button.tsx, card.tsx, input.tsx, label.tsx
│       │   ├── badge.tsx, avatar.tsx, table.tsx
│       │   ├── dialog.tsx, dropdown-menu.tsx, select.tsx
│       └── pages/
│           ├── auth/LoginPage.tsx        # Zod + react-hook-form login form
│           ├── auth/RegisterPage.tsx     # Zod + react-hook-form registration
│           ├── dashboard/DashboardPage.tsx  # Welcome card + Recharts chart + Socket.IO status
│           ├── admin/AdminLayout.tsx     # Sidebar layout with avatar dropdown
│           ├── admin/AdminUsersPage.tsx  # TanStack Table + pagination
│           └── NotFoundPage.tsx
└── docs/
    ├── app-overview.md                   # This file
    └── superpowers/
        ├── plans/
        └── specs/
```

---

## Key Architecture Notes

- **No persistence** — all data resets on server restart; PG in the project name implies PostgreSQL is planned but not implemented
- **Refresh token rotation** — each `/refresh` call invalidates the old token and issues a new one
- **Axios interceptor** — auto-attaches `Bearer` token and silently retries on 401 with the refresh token
- **Socket.IO** — real-time ping/pong channel with live/offline badge on the dashboard
- **Bull job** — runs every hour to clear expired refresh tokens (in-memory only)
- **Admin creation** — not possible through the UI; the code assigns `role: 'user'` on all registrations. To get an admin, you'd need to edit the in-memory array or add a seed
- **Passport OAuth2** — the package is a dependency but has no implemented strategy or routes
