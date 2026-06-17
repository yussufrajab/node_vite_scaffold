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
