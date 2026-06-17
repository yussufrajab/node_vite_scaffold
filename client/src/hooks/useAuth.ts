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
