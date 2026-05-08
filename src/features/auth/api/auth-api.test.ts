import { afterEach, describe, expect, it, vi } from "vitest";

describe("auth api helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("resolves relative avatar paths against the API base URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveUserAvatarUrl } =
      await import("@/features/auth/api/auth-api");

    expect(resolveUserAvatarUrl("/user-avatars/avatar-1")).toBe(
      "https://api.example.com/api/v1/user-avatars/avatar-1",
    );
  });

  it("keeps absolute avatar URLs unchanged", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveUserAvatarUrl } =
      await import("@/features/auth/api/auth-api");

    expect(resolveUserAvatarUrl("https://cdn.example.com/avatar.png")).toBe(
      "https://cdn.example.com/avatar.png",
    );
  });

  it("treats omitted avatar URLs as null", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveUserAvatarUrl } =
      await import("@/features/auth/api/auth-api");

    expect(resolveUserAvatarUrl(undefined)).toBeNull();
  });

  it("normalizes login responses that omit avatarUrl", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              user: {
                id: "user-1",
                email: "traveler@example.com",
                displayName: "Traveler",
                createdAt: "2026-04-15T08:07:27.171Z",
                updatedAt: "2026-04-15T08:07:27.171Z",
              },
              tokens: {
                tokenType: "Bearer",
                accessToken: "access-token",
                accessTokenExpiresIn: 900,
                refreshToken: "refresh-token",
                refreshTokenExpiresIn: 604800,
              },
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    const { login } = await import("@/features/auth/api/auth-api");

    await expect(
      login({
        email: "traveler@example.com",
        password: "password123",
      }),
    ).resolves.toEqual({
      user: {
        id: "user-1",
        email: "traveler@example.com",
        displayName: "Traveler",
        avatarUrl: null,
        createdAt: "2026-04-15T08:07:27.171Z",
        updatedAt: "2026-04-15T08:07:27.171Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token",
        refreshTokenExpiresIn: 604800,
      },
    });
  });
});
