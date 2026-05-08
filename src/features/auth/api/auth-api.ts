import { env } from "@/app/config/env";
import { request } from "@/shared/api/http-client";
import type { User } from "@/shared/types/user";

type ApiUser = Omit<User, "avatarUrl"> & {
  avatarUrl?: string | null;
};

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

type ApiAuthSession = {
  user: ApiUser;
  tokens: AuthTokens;
};

export async function register(payload: {
  displayName: string;
  email: string;
  password: string;
}) {
  const session = await request<ApiAuthSession, typeof payload>("/auth/register", {
    method: "POST",
    body: payload,
  });

  return normalizeAuthSession(session);
}

export async function login(payload: { email: string; password: string }) {
  const session = await request<ApiAuthSession, typeof payload>("/auth/login", {
    method: "POST",
    body: payload,
  });

  return normalizeAuthSession(session);
}

export async function getCurrentUser() {
  const result = await request<{ user: ApiUser }>("/auth/me", {
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
  const result = await request<{ user: ApiUser }, typeof payload>("/auth/me", {
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

  const result = await request<{ user: ApiUser }, FormData>("/auth/me/avatar", {
    method: "POST",
    auth: true,
    body: formData,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export async function deleteCurrentUserAvatar() {
  const result = await request<{ user: ApiUser }>("/auth/me/avatar", {
    method: "DELETE",
    auth: true,
  });

  return {
    user: normalizeUser(result.user),
  };
}

export function resolveUserAvatarUrl(pathOrUrl?: string | null) {
  if (typeof pathOrUrl !== "string") {
    return null;
  }

  const normalizedValue = pathOrUrl.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  const normalizedPath = normalizedValue.startsWith("/")
    ? normalizedValue.slice(1)
    : normalizedValue;
  const normalizedBaseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl
    : `${env.apiBaseUrl}/`;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

function normalizeAuthSession(session: ApiAuthSession): AuthSession {
  return {
    ...session,
    user: normalizeUser(session.user),
  };
}

function normalizeUser(user: ApiUser): User {
  return {
    ...user,
    avatarUrl: resolveUserAvatarUrl(user.avatarUrl),
  };
}
