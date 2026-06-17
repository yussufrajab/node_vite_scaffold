# General-Purpose Full-Stack Scaffold

**Date:** 2026-06-17
**Stack:** React 19 + TypeScript + Vite + TailwindCSS 3.4 + React Router v7 + Zustand + Axios + React Hook Form + Zod + Recharts + TanStack Table + shadcn/ui (frontend) | Node.js 20 + Express 5 + TypeScript + Socket.IO + JWT (jose) + Passport.js OAuth2 + bcryptjs + Bull (Redis) + ESLint 9 (backend)

## Project Structure

```
postgrestest/
├── client/                       # Vite + React 19 SPA
│   ├── src/
│   │   ├── components/           # shadcn/ui primitives + shared UI components
│   │   │   └── ui/               # shadcn/ui generated components
│   │   ├── pages/                # Route-level page components
│   │   │   ├── auth/             # Login, Register pages
│   │   │   ├── dashboard/        # Authenticated dashboard
│   │   │   └── admin/            # Admin panel (users table, charts)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── stores/               # Zustand stores (auth store)
│   │   ├── lib/                  # Axios instance, API functions, cn() utility
│   │   ├── types/                # Frontend-specific types
│   │   └── router/               # React Router configuration + guards
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
├── server/                       # Express 5 + TypeScript REST API
│   ├── src/
│   │   ├── routes/               # REST endpoint handlers
│   │   │   ├── auth.routes.ts
│   │   │   └── users.routes.ts
│   │   ├── middleware/           # JWT verify, error handler, auth guard
│   │   ├── services/             # Business logic (auth, user CRUD)
│   │   ├── socket/               # Socket.IO setup + namespace handlers
│   │   ├── jobs/                 # Bull queue definitions & processors
│   │   ├── config/               # Env-based configuration
│   │   └── index.ts              # Express app bootstrap
│   ├── tsconfig.json
│   └── package.json
├── shared/                       # Shared TypeScript types & constants
│   ├── types/                    # DTOs, API response shapes
│   └── package.json
├── package.json                  # Root workspace config
└── .gitignore
```

## Architecture & Data Flow

### Authentication Flow
1. User registers via POST /api/auth/register (bcryptjs hash)
2. User logs in via POST /api/auth/login → server issues JWT access token (15min, jose) + httpOnly refresh token (7d)
3. Axios interceptor attaches `Authorization: Bearer <access>` to every request
4. On 401, interceptor calls POST /api/auth/refresh, retries original request
5. Logout clears both tokens server-side (refresh token blacklist via Redis)

### Routing
- **Public**: `/login`, `/register`
- **Protected**: `/dashboard`, `/admin/*`
- **Admin-only**: `/admin/users`, `/admin/settings`
- React Router `loader` functions check auth state from Zustand store

### State Management
- **Zustand auth store**: user object, tokens, login/logout/refresh actions
- **Local state/React Query patterns**: page-level data stays in components or custom hooks
- **Socket.IO connection**: established on login, torn down on logout

### API Layer
- Axios instance with baseURL from env, JSON header defaults
- Request interceptor: attach access token
- Response interceptor: catch 401 → attempt refresh → retry → fail
- All API responses follow: `{ data: T, error?: string, meta?: { page, limit, total } }`

## Out-of-the-Box Features

1. **Auth scaffolding**: Login, Register, token refresh, protected routes
2. **User CRUD**: Admin table with TanStack Table (sort, paginate)
3. **Dashboard demo**: Recharts card with mock data
4. **Socket.IO**: Connection management in auth store, heartbeats
5. **Bull queue**: Demo job (clean expired refresh tokens, runs every hour)
6. **shadcn/ui**: Button, Input, Card, Dialog, Table, Sheet, Avatar, Badge initialized
7. **Form validation**: React Hook Form + Zod for login/register forms
8. **Error boundary**: React error boundary + Express centralized error middleware
9. **ESLint**: Flat config for server + client

## Error Handling

- **Server**: Express error middleware catches all thrown errors → `{ error: message, code }`
- **Client**: Axios response interceptor normalizes errors → consistent `{ error: string }` shape
- **Forms**: Zod schema errors displayed inline per field
- **Boundary**: React `<ErrorBoundary>` wraps authenticated layout

## What's NOT Included

- GPS / bus tracking (removed per user request)
- i18n / multi-language (removed per user request)
- Database setup (expects a DB but no schema is scaffolded — the user brings their own)
- Production deployment config (Dockerfile, CI/CD)
- Test suite (not specified in stack)
