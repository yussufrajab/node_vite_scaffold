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
