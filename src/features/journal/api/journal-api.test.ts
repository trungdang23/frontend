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

  it("keeps signed relative asset query strings when resolving against the API base URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { resolveJournalAssetUrl } =
      await import("@/features/journal/api/journal-api");

    expect(
      resolveJournalAssetUrl(
        "/journal-assets/asset-1?expiresAt=123&signature=signed",
      ),
    ).toBe(
      "https://api.example.com/api/v1/journal-assets/asset-1?expiresAt=123&signature=signed",
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

  it("normalizes relative signed journal photo urls in journal payloads", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");

    const { normalizeTripJournalAssetUrls } =
      await import("@/features/journal/api/journal-api");

    const result = normalizeTripJournalAssetUrls({
      trip: {
        id: "trip-1",
        userId: "user-1",
        name: "Hoi An",
        destination: null,
        summaryNotes: null,
        coverImageUrl: null,
        startDate: "2026-07-12",
        endDate: "2026-07-15",
        timezone: null,
        budgetMode: "manual",
        manualBudgetAmount: 5000000,
        manualBudgetCurrency: "VND",
        visibility: "private",
        budgetAmount: 5000000,
        budgetCurrency: "VND",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
      journal: {
        id: "journal-1",
        tripId: "trip-1",
        sceneVersion: 1,
        page: {
          width: 1200,
          height: 1600,
          background: {
            style: "paper-cream",
          },
        },
        objects: [
          {
            id: "photo-1",
            type: "photo",
            x: 100,
            y: 120,
            width: 300,
            height: 220,
            rotation: 0,
            zIndex: 1,
            locked: false,
            props: {
              assetId: "asset-1",
              imageUrl:
                "/journal-assets/asset-1?expiresAt=123&signature=signed",
            },
          },
        ],
        visibility: "private",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    });

    expect(result.journal.objects[0]?.props.imageUrl).toBe(
      "https://api.example.com/api/v1/journal-assets/asset-1?expiresAt=123&signature=signed",
    );
  });
});
