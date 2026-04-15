import { request } from '@/shared/api/http-client';
import { User } from '@/shared/types/user';

export type AuthTokens = {
  tokenType: 'Bearer';
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
};

export type AuthSession = {
  user: User;
  tokens: AuthTokens;
};

export async function register(payload: {
  displayName: string;
  email: string;
  password: string;
}) {
  return request<AuthSession, typeof payload>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthSession, typeof payload>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function getCurrentUser() {
  return request<{ user: User }>('/auth/me', {
    auth: true,
  });
}

export async function refreshTokens(payload: { refreshToken: string }) {
  return request<{ tokens: AuthTokens }, typeof payload>('/auth/refresh', {
    method: 'POST',
    body: payload,
  });
}
