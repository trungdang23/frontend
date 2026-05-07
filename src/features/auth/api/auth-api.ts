import { env } from "@/app/config/env";
import { request } from "@/shared/api/http-client";
import type { User } from "@/shared/types/user";

export type AuthTokens = {
  tokenType: "Bearer";
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
  const session = await request<AuthSession, typeof payload>("/auth/register", {
    method: "POST",
    body: payload,
  });

  return normalizeAuthSession(session);
}

export async function login(payload: { email: string; password: string }) {
  const session = await request<AuthSession, typeof payload>("/auth/login", {
    method: "POST",
    body: payload,
  });

  return normalizeAuthSession(session);
}

export async function getCurrentUser() {
  const result = await request<{ user: User }>("/auth/me", {
    auth: true,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export async function refreshTokens(payload: { refreshToken: string }) {
  return request<{ tokens: AuthTokens }, typeof payload>("/auth/refresh", {
    method: "POST",
    body: payload,
  });
}

export async function logout(payload: { refreshToken: string }) {
  return request<{ loggedOut: true }, typeof payload>("/auth/logout", {
    method: "POST",
    body: payload,
  });
}

export async function updateCurrentUserProfile(payload: {
  displayName: string;
}) {
  const result = await request<{ user: User }, typeof payload>("/auth/me", {
    method: "PATCH",
    auth: true,
    body: payload,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export async function uploadCurrentUserAvatar(file: File) {
  const formData = new FormData();

  formData.set("file", file);

  const result = await request<{ user: User }, FormData>("/auth/me/avatar", {
    method: "POST",
    auth: true,
    body: formData,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export async function deleteCurrentUserAvatar() {
  const result = await request<{ user: User }>("/auth/me/avatar", {
    method: "DELETE",
    auth: true,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export function resolveUserAvatarUrl(pathOrUrl: string | null) {
  if (pathOrUrl === null || pathOrUrl.trim().length === 0) {
    return null;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl.slice(1)
    : pathOrUrl;
  const normalizedBaseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl
    : `${env.apiBaseUrl}/`;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

function normalizeAuthSession(session: AuthSession): AuthSession {
  return {
    ...session,
    user: normalizeUser(session.user),
  };
}

function normalizeUser(user: User): User {
  return {
    ...user,
    avatarUrl: resolveUserAvatarUrl(user.avatarUrl),
  };
}
