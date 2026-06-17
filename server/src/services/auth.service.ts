import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/index.js';
import { AppError } from '../middleware/error.middleware.js';

// In-memory store — swap with a real DB in production
export interface UserRecord {
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
