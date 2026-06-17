# postgrestest

A full-stack authentication & admin dashboard scaffold — monorepo with React 19 + Vite 8 frontend and Express 5 backend.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp server/.env.example server/.env

# Start both client and server in dev mode
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

## Features

- **Auth**: Email/password registration and login with JWT (access + refresh token rotation)
- **Dashboard**: Welcome view with a live Socket.IO connection indicator and Recharts analytics chart
- **Admin Panel**: User management with TanStack Table (sortable, paginated) — requires admin role
- **Real-time**: Socket.IO ping/pong channel with connection status badge
- **Background Jobs**: Bull queue with Redis — hourly cleanup of expired refresh tokens

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 3.4, React Router 7 |
| **Backend** | Express 5, TypeScript, Socket.IO 4 |
| **Auth** | jose (JWT), bcryptjs |
| **UI** | Radix UI primitives, TanStack Table, Recharts, Lucide icons |
| **State / Forms** | Zustand, React Hook Form, Zod |
| **Queues** | Bull (Redis) |
| **HTTP** | Axios, CORS |

## Environment Variables

Copy `server/.env.example` to `server/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | `change-me-to-a-random-secret` | JWT signing key |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |

## API Endpoints

| Method | Path | Auth | Admin | Purpose |
|--------|------|------|-------|---------|
| POST | `/api/auth/register` | — | — | Register new user |
| POST | `/api/auth/login` | — | — | Login |
| POST | `/api/auth/refresh` | — | — | Rotate refresh token |
| POST | `/api/auth/logout` | Yes | — | Logout |
| GET | `/api/auth/me` | Yes | — | Current user profile |
| GET | `/api/users` | Yes | Yes | Paginated user list |
| GET | `/api/users/:id` | Yes | — | Get user by ID |
| GET | `/api/health` | — | — | Health check |

## Project Structure

```
├── shared/          Shared TypeScript types (UserDto, API envelope, auth DTOs)
├── server/          Express backend with JWT auth, Socket.IO, Bull jobs
│   └── src/
│       ├── config/      Environment config
│       ├── routes/      Auth + user route handlers
│       ├── services/    Business logic (in-memory store)
│       ├── middleware/   JWT auth, admin guard, error handler
│       ├── socket/      Socket.IO setup
│       └── jobs/        Bull queue for periodic cleanup
├── client/          React frontend with Vite
│   └── src/
│       ├── router/       Route definitions with auth guards
│       ├── stores/       Zustand auth state
│       ├── hooks/        useAuth hook
│       ├── lib/          Axios client with auto-refresh interceptor
│       ├── components/ui/  Radix + Tailwind primitives
│       └── pages/        Login, Register, Dashboard, Admin
└── docs/            Documentation
```

## Notes

- **No persistence yet** — all data is in-memory and resets on server restart
- **Admin users** cannot be created through the UI; registration always assigns `role: 'user'`
- **Redis** is required for the Bull job queue (hourly refresh token cleanup)
- Passport OAuth2 strategy is included as a dependency but not yet wired up
