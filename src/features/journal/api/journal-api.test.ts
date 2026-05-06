import { afterEach, describe, expect, it, vi } from "vitest";

describe("journal api helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("resolves relative asset paths against the API base URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveJournalAssetUrl } =
      await import("@/features/journal/api/journal-api");

    expect(resolveJournalAssetUrl("/journal-assets/asset-1")).toBe(
      "https://api.example.com/api/v1/journal-assets/asset-1",
    );
  });

  it("keeps absolute asset URLs unchanged", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveJournalAssetUrl } =
      await import("@/features/journal/api/journal-api");

    expect(resolveJournalAssetUrl("https://cdn.example.com/asset-1.png")).toBe(
      "https://cdn.example.com/asset-1.png",
    );
  });
});
