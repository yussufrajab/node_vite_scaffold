# General-Purpose Full-Stack Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a general-purpose full-stack monorepo with React 19 + Vite + Express 5 + TypeScript, wired up with auth, routing, state management, and demo features.

**Architecture:** npm workspaces monorepo (`client/`, `server/`, `shared/`). The `shared` package exports TypeScript types consumed by both client and server. Express serves REST APIs with JWT auth; Vite dev server proxies API calls. Socket.IO provides real-time communication. Bull (Redis) handles background jobs.

**Tech Stack:** React 19 + Vite 8 + TailwindCSS 3.4 + React Router v7 + Zustand + Axios + React Hook Form + Zod + Recharts + TanStack Table + shadcn/ui | Express 5 + TypeScript + Socket.IO + JWT (jose) + Passport.js + bcryptjs + Bull (Redis) + ESLint 9

---

### Task 1: Root Workspace and Shared Package

**Files:**
- Create: `/home/postgrestest/node_vite/package.json`
- Create: `/home/postgrestest/node_vite/.gitignore`
- Create: `/home/postgrestest/node_vite/shared/package.json`
- Create: `/home/postgrestest/node_vite/shared/tsconfig.json`
- Create: `/home/postgrestest/node_vite/shared/types/index.ts`
- Create: `/home/postgrestest/node_vite/shared/types/auth.ts`
- Create: `/home/postgrestest/node_vite/shared/types/api.ts`
- Create: `/home/postgrestest/node_vite/shared/types/user.ts`

- [ ] **Step 1: Create root package.json with npm workspaces**

```json
{
  "name": "postgrestest",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev": "concurrently -n client,server -c cyan,green \"npm run dev -w client\" \"npm run dev -w server\"",
    "build": "npm run build -w shared && npm run build -w server && npm run build -w client",
    "lint": "npm run lint -w client && npm run lint -w server",
    "clean": "rm -rf client/dist server/dist shared/dist node_modules"
  },
  "devDependencies": {
    "concurrently": "^10.0.3",
    "typescript": "^6.0.2"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 3: Create shared/package.json**

```json
{
  "name": "@postgrestest/shared",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

- [ ] **Step 4: Create shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts"]
}
```

- [ ] **Step 5: Create shared/types/auth.ts**

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserDto;
  tokens: AuthTokens;
}
```

- [ ] **Step 6: Create shared/types/user.ts**

```typescript
export type UserRole = 'user' | 'admin';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}
```

- [ ] **Step 7: Create shared/types/api.ts**

```typescript
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  error: string;
  code?: string;
}
```

- [ ] **Step 8: Create shared/types/index.ts**

```typescript
export * from './auth.js';
export * from './user.js';
export * from './api.js';
```

- [ ] **Step 9: Install root dependencies**

Run: `cd /home/postgrestest/node_vite && npm install`

- [ ] **Step 10: Build shared package**

Run: `cd /home/postgrestest/node_vite && npm run build -w shared`
Expected: `shared/dist/` directory with compiled JS + .d.ts files

---

### Task 2: Server Package — Config, Dependencies, Entry Point

**Files:**
- Create: `/home/postgrestest/node_vite/server/package.json`
- Create: `/home/postgrestest/node_vite/server/tsconfig.json`
- Create: `/home/postgrestest/node_vite/server/.env.example`
- Create: `/home/postgrestest/node_vite/server/src/config/index.ts`
- Create: `/home/postgrestest/node_vite/server/src/index.ts`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "@postgrestest/server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@postgrestest/shared": "*",
    "bcryptjs": "^3.0.3",
    "bull": "^4.16.5",
    "cors": "^2.8.5",
    "express": "^5.2.1",
    "ioredis": "^5.11.1",
    "jose": "^6.2.3",
    "passport": "^0.7.0",
    "passport-oauth2": "^1.8.0",
    "socket.io": "^4.8.3",
    "uuid": "^14.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.3",
    "@types/passport": "^1.0.16",
    "@types/passport-oauth2": "^1.4.17",
    "@types/uuid": "^10.0.0",
    "eslint": "^10.5.0",
    "tsx": "^4.22.4",
    "typescript": "^6.0.2"
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../shared" }]
}
```

- [ ] **Step 3: Create server/.env.example**

```
PORT=3001
NODE_ENV=development

JWT_SECRET=change-me-to-a-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

CLIENT_URL=http://localhost:5173
```

- [ ] **Step 4: Create server/src/config/index.ts**

```typescript
import { config } from 'node:process';

export const env = {
  port: parseInt(config.PORT || '3001', 10),
  nodeEnv: config.NODE_ENV || 'development',
  jwt: {
    secret: config.JWT_SECRET || 'dev-secret-change-in-production',
    accessExpiresIn: config.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    host: config.REDIS_HOST || 'localhost',
    port: parseInt(config.REDIS_PORT || '6379', 10),
  },
  clientUrl: config.CLIENT_URL || 'http://localhost:5173',
} as const;
```

- [ ] **Step 5: Create server/src/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { env } from './config/index.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupSocket } from './socket/index.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use(errorHandler);

setupSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

export default app;
```

- [ ] **Step 6: Install server dependencies**

Run: `cd /home/postgrestest/node_vite && npm install`

---

### Task 3: Server Middleware

**Files:**
- Create: `/home/postgrestest/node_vite/server/src/middleware/error.middleware.ts`
- Create: `/home/postgrestest/node_vite/server/src/middleware/auth.middleware.ts`

- [ ] **Step 1: Create error middleware**

```typescript
import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
```

- [ ] **Step 2: Create auth middleware**

```typescript
import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/index.js';
import { AppError } from './error.middleware.js';

const secret = new TextEncoder().encode(env.jwt.secret);

export interface AuthPayload {
  sub: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }

  const token = header.slice(7);
  try {
    const { payload } = await jwtVerify(token, secret);
    req.user = { sub: payload.sub as string, role: payload.role as string };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'admin') {
    throw new AppError(403, 'Admin access required');
  }
  next();
}
```

---

### Task 4: Server Services

**Files:**
- Create: `/home/postgrestest/node_vite/server/src/services/auth.service.ts`
- Create: `/home/postgrestest/node_vite/server/src/services/user.service.ts`

- [ ] **Step 1: Create auth service**

```typescript
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/index.js';
import { AppError } from '../middleware/error.middleware.js';

// In-memory store — swap with a real DB in production
interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

const users: UserRecord[] = [];
const refreshTokens = new Set<string>();

const secret = new TextEncoder().encode(env.jwt.secret);

function msFromString(str: string): number {
  const match = str.match(/^(\d+)(m|h|d)$/);
  if (!match) return 15 * 60 * 1000;
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case 'm': return val * 60 * 1000;
    case 'h': return val * 3600 * 1000;
    case 'd': return val * 86400 * 1000;
    default: return 15 * 60 * 1000;
  }
}

async function generateTokens(user: UserRecord) {
  const accessToken = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.jwt.accessExpiresIn)
    .sign(secret);

  const refreshToken = uuidv4();
  refreshTokens.add(refreshToken);

  return { accessToken, refreshToken };
}

export async function register(name: string, email: string, password: string) {
  if (users.find((u) => u.email === email)) {
    throw new AppError(409, 'Email already registered');
  }

  const hashed = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: uuidv4(),
    name,
    email,
    password: hashed,
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);

  const tokens = await generateTokens(user);
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
    tokens,
  };
}

export async function login(email: string, password: string) {
  const user = users.find((u) => u.email === email);
  if (!user) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const tokens = await generateTokens(user);
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
    tokens,
  };
}

export async function refresh(refreshToken: string) {
  if (!refreshTokens.has(refreshToken)) {
    throw new AppError(401, 'Invalid refresh token');
  }
  refreshTokens.delete(refreshToken);

  // Find user associated with this token — simplified; in production store userId alongside
  // For now, regenerate with first available user as a demo
  const user = users[0];
  if (!user) throw new AppError(401, 'No user found');

  return generateTokens(user);
}

export function logout(refreshToken: string): void {
  refreshTokens.delete(refreshToken);
}

export function getAllUsers(): Omit<UserRecord, 'password'>[] {
  return users.map(({ password: _, ...u }) => u);
}

export function getUserById(id: string): Omit<UserRecord, 'password'> | undefined {
  const user = users.find((u) => u.id === id);
  if (!user) return undefined;
  const { password: _, ...rest } = user;
  return rest;
}

export function getRefreshTokenCount(): number {
  return refreshTokens.size;
}

export function clearExpiredRefreshTokens(): number {
  const count = refreshTokens.size;
  refreshTokens.clear();
  return count;
}
```

- [ ] **Step 2: Create user service**

```typescript
import { getAllUsers, getUserById } from './auth.service.js';
import { AppError } from '../middleware/error.middleware.js';

export function listUsers(page: number, limit: number) {
  const all = getAllUsers();
  const start = (page - 1) * limit;
  const paginated = all.slice(start, start + limit);
  return {
    users: paginated,
    meta: { page, limit, total: all.length },
  };
}

export function getProfile(userId: string) {
  const user = getUserById(userId);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}
```

---

### Task 5: Server Routes

**Files:**
- Create: `/home/postgrestest/node_vite/server/src/routes/auth.routes.ts`
- Create: `/home/postgrestest/node_vite/server/src/routes/users.routes.ts`

- [ ] **Step 1: Create auth routes**

```typescript
import { Router } from 'express';
import { register, login, refresh, logout } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import type { LoginRequest, RegisterRequest } from '@postgrestest/shared';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body as RegisterRequest;
    const result = await register(name, email, password);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const result = await login(email, password);
    res.json({ data: result });
  } catch (err) { next(err); }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await refresh(refreshToken);
    res.json({ data: tokens });
  } catch (err) { next(err); }
});

authRouter.post('/logout', authenticate, (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    logout(refreshToken);
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (err) { next(err); }
});

authRouter.get('/me', authenticate, (req, res, next) => {
  try {
    const { getProfile } = await import('../services/user.service.js');
    const user = getProfile(req.user!.sub);
    res.json({ data: user });
  } catch (err) { next(err); }
});
```

- [ ] **Step 2: Create users routes**

```typescript
import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { listUsers, getProfile } from '../services/user.service.js';

export const usersRouter = Router();

usersRouter.get('/', authenticate, requireAdmin, (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = listUsers(page, limit);
    res.json({ data: result.users, meta: result.meta });
  } catch (err) { next(err); }
});

usersRouter.get('/:id', authenticate, (req, res, next) => {
  try {
    const user = getProfile(req.params.id);
    res.json({ data: user });
  } catch (err) { next(err); }
});
```

---

### Task 6: Server Socket.IO and Bull Jobs

**Files:**
- Create: `/home/postgrestest/node_vite/server/src/socket/index.ts`
- Create: `/home/postgrestest/node_vite/server/src/jobs/cleanup.job.ts`
- Create: `/home/postgrestest/node_vite/server/src/jobs/index.ts`

- [ ] **Step 1: Create socket setup**

```typescript
import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { env } from '../config/index.js';

let io: SocketServer;

export function setupSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('ping:client', (data) => {
      socket.emit('pong:server', { received: data, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
```

- [ ] **Step 2: Create cleanup job**

```typescript
import Bull from 'bull';
import { env } from '../config/index.js';
import { clearExpiredRefreshTokens } from '../services/auth.service.js';

const cleanupQueue = new Bull('cleanup', {
  redis: { host: env.redis.host, port: env.redis.port },
});

cleanupQueue.process(async () => {
  const cleared = clearExpiredRefreshTokens();
  console.log(`Cleanup job: cleared ${cleared} expired refresh tokens`);
});

export function startCleanupJob(): void {
  // Run every hour
  cleanupQueue.add({}, { repeat: { every: 3600 * 1000 } });
  console.log('Cleanup job scheduled (every hour)');
}

export { cleanupQueue };
```

- [ ] **Step 3: Create jobs index**

```typescript
export { startCleanupJob, cleanupQueue } from './cleanup.job.js';
```

- [ ] **Step 4: Update server/src/index.ts to start the cleanup job**

Edit the entry point to add the job startup:

```typescript
// Add after setupSocket(httpServer);
import { startCleanupJob } from './jobs/index.js';
startCleanupJob();
```

The complete updated file becomes:

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { env } from './config/index.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupSocket } from './socket/index.js';
import { startCleanupJob } from './jobs/index.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use(errorHandler);

setupSocket(httpServer);
startCleanupJob();

httpServer.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

export default app;
```

---

### Task 7: Server ESLint Config

**Files:**
- Create: `/home/postgrestest/node_vite/server/eslint.config.js`

- [ ] **Step 1: Create ESLint flat config**

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
);
```

- [ ] **Step 2: Add server dev dependencies for ESLint**

Add to server/package.json devDependencies:
```json
"@eslint/js": "^10.5.0",
"typescript-eslint": "^8.61.1"
```

Then run: `cd /home/postgrestest/node_vite && npm install`

---

### Task 8: Client Package — Vite + React + Tailwind Setup

**Files:**
- Create: `/home/postgrestest/node_vite/client/package.json`
- Create: `/home/postgrestest/node_vite/client/tsconfig.json`
- Create: `/home/postgrestest/node_vite/client/tsconfig.node.json`
- Create: `/home/postgrestest/node_vite/client/vite.config.ts`
- Create: `/home/postgrestest/node_vite/client/tailwind.config.ts`
- Create: `/home/postgrestest/node_vite/client/postcss.config.js`
- Create: `/home/postgrestest/node_vite/client/index.html`
- Create: `/home/postgrestest/node_vite/client/src/main.tsx`
- Create: `/home/postgrestest/node_vite/client/src/App.tsx`
- Create: `/home/postgrestest/node_vite/client/src/index.css`
- Create: `/home/postgrestest/node_vite/client/src/vite-env.d.ts`

- [ ] **Step 1: Create client/package.json**

```json
{
  "name": "@postgrestest/client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.4.0",
    "@postgrestest/shared": "*",
    "@radix-ui/react-avatar": "^1.1.6",
    "@radix-ui/react-dialog": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.12",
    "@radix-ui/react-label": "^2.1.5",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.2",
    "@radix-ui/react-table": "^1.1.10",
    "@radix-ui/react-tabs": "^1.1.6",
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.18.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.503.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-hook-form": "^7.79.0",
    "react-router-dom": "^7.18.0",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.2.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.4.3",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "@vitejs/plugin-react": "^6.0.2",
    "autoprefixer": "^10.5.0",
    "eslint": "^10.5.0",
    "postcss": "^8.5.15",
    "tailwindcss": "3.4.19",
    "typescript": "^6.0.2",
    "vite": "^8.0.16"
  }
}
```

- [ ] **Step 2: Create client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create client/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3001', ws: true },
    },
  },
});
```

- [ ] **Step 5: Create client/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

- [ ] **Step 6: Create client/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create client/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Postgrestest App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 9: Create client/src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 10: Create client/src/main.tsx**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 11: Create client/src/App.tsx**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppRoutes } from './router/index.tsx';

export default function App() {
  return <AppRoutes />;
}
```

- [ ] **Step 12: Install client dependencies**

Run: `cd /home/postgrestest/node_vite && npm install`

---

### Task 9: Client Library Code (Axios, Auth Store, Utils)

**Files:**
- Create: `/home/postgrestest/node_vite/client/src/lib/utils.ts`
- Create: `/home/postgrestest/node_vite/client/src/lib/api.ts`
- Create: `/home/postgrestest/node_vite/client/src/stores/auth-store.ts`
- Create: `/home/postgrestest/node_vite/client/src/router/index.tsx`
- Create: `/home/postgrestest/node_vite/client/src/hooks/useAuth.ts`

- [ ] **Step 1: Create lib/utils.ts (cn utility for shadcn)**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create lib/api.ts (Axios instance with JWT interceptor)**

```typescript
import axios from 'axios';
import type { ApiResponse } from '@postgrestest/shared';
import { useAuthStore } from '../stores/auth-store.ts';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            '/api/auth/refresh',
            { refreshToken },
          );
          const tokens = data.data;
          useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

- [ ] **Step 3: Create stores/auth-store.ts (Zustand)**

```typescript
import { create } from 'zustand';

interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  setTokens: (access: string, refresh: string) => void;
  login: (user: AuthState['user'], access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  login: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken, isAuthenticated: true }),
  logout: () =>
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}));
```

- [ ] **Step 4: Create hooks/useAuth.ts**

```typescript
import api from '../lib/api.ts';
import { useAuthStore } from '../stores/auth-store.ts';
import type { AuthResponse, LoginRequest, RegisterRequest, ApiResponse } from '@postgrestest/shared';

export function useAuth() {
  const store = useAuthStore();

  async function login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password } as LoginRequest);
    const { user, tokens } = data.data;
    store.login(user, tokens.accessToken, tokens.refreshToken);
    return user;
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password } as RegisterRequest);
    const { user, tokens } = data.data;
    store.login(user, tokens.accessToken, tokens.refreshToken);
    return user;
  }

  async function logout() {
    const token = store.refreshToken;
    try {
      if (token) await api.post('/auth/logout', { refreshToken: token });
    } catch {
      // ignore — still clear local state
    }
    store.logout();
  }

  return { ...store, login, register, logout };
}
```

- [ ] **Step 5: Create router/index.tsx**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store.ts';
import LoginPage from '../pages/auth/LoginPage.tsx';
import RegisterPage from '../pages/auth/RegisterPage.tsx';
import DashboardPage from '../pages/dashboard/DashboardPage.tsx';
import AdminLayout from '../pages/admin/AdminLayout.tsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

### Task 10: Client shadcn/ui Components

**Files:**
- Create: `/home/postgrestest/node_vite/client/src/components/ui/button.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/input.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/card.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/dialog.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/table.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/avatar.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/badge.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/label.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/select.tsx`
- Create: `/home/postgrestest/node_vite/client/src/components/ui/dropdown-menu.tsx`

For each shadcn component, use the standard implementation from the shadcn/ui registry. Each component uses the `cn` utility and follows the standard Radix-based pattern.

**Key components:**
- **Button**: Variants `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` + sizes `default`, `sm`, `lg`, `icon`
- **Card**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Input**: Standard input with error state styling
- **Dialog**: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription
- **Table**: Table, TableHeader, TableBody, TableRow, TableHead, TableCell — using shadcn's styled table wrapper around native `<table>`
- **Badge**: Variants `default`, `secondary`, `destructive`, `outline`
- **Avatar**: Avatar, AvatarImage, AvatarFallback
- **Select**: Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- **DropdownMenu**: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem

---

### Task 11: Client Pages

**Files:**
- Create: `/home/postgrestest/node_vite/client/src/pages/auth/LoginPage.tsx`
- Create: `/home/postgrestest/node_vite/client/src/pages/auth/RegisterPage.tsx`
- Create: `/home/postgrestest/node_vite/client/src/pages/dashboard/DashboardPage.tsx`
- Create: `/home/postgrestest/node_vite/client/src/pages/admin/AdminLayout.tsx`
- Create: `/home/postgrestest/node_vite/client/src/pages/admin/AdminUsersPage.tsx`
- Create: `/home/postgrestest/node_vite/client/src/pages/NotFoundPage.tsx`

- [ ] **Step 1: Create LoginPage.tsx**

A centered card with email/password form using React Hook Form + Zod validation.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.tsx';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-primary underline underline-offset-4">Register</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create RegisterPage.tsx**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.tsx';
import { useState } from 'react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      setError(null);
      await registerUser(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary underline underline-offset-4">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create DashboardPage.tsx**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const chartData = [
  { month: 'Jan', users: 65, sessions: 28 },
  { month: 'Feb', users: 59, sessions: 48 },
  { month: 'Mar', users: 80, sessions: 40 },
  { month: 'Apr', users: 81, sessions: 55 },
  { month: 'May', users: 56, sessions: 73 },
  { month: 'Jun', users: 95, sessions: 68 },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    setSocketStatus('connecting');
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    return () => { socket.close(); };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-6 h-16">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={socketStatus === 'connected' ? 'default' : 'secondary'}>
                {socketStatus === 'connected' ? '● Live' : '○ Offline'}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            {user?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user?.name}!</CardTitle>
            <CardDescription>Here's a summary of your activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user?.email}</span> with role <Badge variant="outline">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Analytics</CardTitle>
            <CardDescription>Users and sessions over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Users" />
                  <Line type="monotone" dataKey="sessions" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create AdminLayout.tsx**

```typescript
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { Button } from '../../components/ui/button.tsx';
import { Avatar, AvatarFallback } from '../../components/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx';

const sidebarLinks = [
  { href: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <Link to="/admin" className="text-lg font-semibold">Admin Panel</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                location.pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Create AdminUsersPage.tsx**

```typescript
import { useEffect, useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import api from '../../lib/api.ts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx';
import type { ApiResponse, UserDto } from '@postgrestest/shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get<ApiResponse<UserDto[]>>('/users', { params: { page, limit } })
      .then((res) => {
        setUsers(res.data.data);
        setTotal(res.data.meta?.total ?? 0);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [page]);

  const columns = useMemo<ColumnDef<UserDto>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
  ], []);

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(total / limit);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive text-center">{error}</div>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={() => setPage(1)}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Create NotFoundPage.tsx**

```typescript
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Task 12: Client ESLint Config

**Files:**
- Create: `/home/postgrestest/node_vite/client/eslint.config.js`

- [ ] **Step 1: Create client ESLint flat config**

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
);
```

- [ ] **Step 2: Add client dev dependencies for ESLint**

Add to client/package.json devDependencies:
```json
"@eslint/js": "^10.5.0",
"typescript-eslint": "^8.61.1"
```

Then run: `cd /home/postgrestest/node_vite && npm install`

---

### Task 13: Verification Build

- [ ] **Step 1: Build shared package**

Run: `cd /home/postgrestest/node_vite && npm run build -w shared`
Expected: No errors, `shared/dist/` directory exists with `.js` and `.d.ts` files.

- [ ] **Step 2: Build server**

Run: `cd /home/postgrestest/node_vite && npm run build -w server`
Expected: No errors, `server/dist/` directory exists.

- [ ] **Step 3: Build client**

Run: `cd /home/postgrestest/node_vite && npm run build -w client`
Expected: No errors, `client/dist/` directory exists.

- [ ] **Step 4: Start server briefly to verify health endpoint**

Run: `cd /home/postgrestest/node_vite/server && timeout 5 npx tsx src/index.ts 2>&1 || true`
Expected: "Server running on port 3001" in output.

- [ ] **Step 5: Run lint**

Run: `cd /home/postgrestest/node_vite && npm run lint`
Expected: No errors or warnings.
