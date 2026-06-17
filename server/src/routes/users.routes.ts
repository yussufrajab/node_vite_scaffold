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
    const user = getProfile(req.params.id as string);
    res.json({ data: user });
  } catch (err) { next(err); }
});
