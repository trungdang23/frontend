import { afterEach, describe, expect, it, vi } from "vitest";

describe("auth api helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
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
});
