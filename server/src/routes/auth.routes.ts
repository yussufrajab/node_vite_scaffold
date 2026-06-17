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

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const { getProfile } = await import('../services/user.service.js');
    const user = getProfile(req.user!.sub);
    res.json({ data: user });
  } catch (err) { next(err); }
});
