import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PublicAuthLayout } from "@/app/router/public-auth-layout";
import { AuthProvider } from "@/features/auth/session/auth-context";
import { useAuth } from "@/features/auth/session/use-auth";
import { LoginPage } from "@/features/auth/routes/login-page";
import { ProtectedRoute } from "@/features/auth/routes/protected-route";
import { LanguageProvider } from "@/shared/i18n/language-provider";

const {
  clearStoredSessionMock,
  readStoredSessionMock,
  writeStoredSessionMock,
} = vi.hoisted(() => ({
  clearStoredSessionMock: vi.fn(),
  readStoredSessionMock: vi.fn(),
  writeStoredSessionMock: vi.fn(),
}));

vi.mock("@/features/auth/session/session-storage", () => ({
  clearStoredSession: clearStoredSessionMock,
  readStoredSession: readStoredSessionMock,
  writeStoredSession: writeStoredSessionMock,
}));

type MockResponseOptions = {
  body: unknown;
  status?: number;
};

function createMockResponse({
  body,
  status = 200,
}: MockResponseOptions): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

type TestInitialEntry = string | { pathname: string; state?: unknown };

function renderWithProviders(initialEntries: TestInitialEntry[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<PublicAuthLayout />}>
                <Route path="login" element={<LoginPage />} />
              </Route>
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <ProtectedProbe />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/trips"
                element={
                  <ProtectedRoute>
                    <TripsProbe />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

function ProtectedProbe() {
  const auth = useAuth();

  return (
    <div>
      <h1>Protected Workspace</h1>
      <button type="button" onClick={() => void auth.logout()}>
        Đăng xuất
      </button>
    </div>
  );
}

function TripsProbe() {
  const auth = useAuth();

  return (
    <div>
      <h1>Trips Workspace</h1>
      <button type="button" onClick={() => void auth.logout()}>
        Đăng xuất
      </button>
    </div>
  );
}

describe("Auth session lifecycle", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    clearStoredSessionMock.mockReset();
    fetchMock.mockReset();
    readStoredSessionMock.mockReset();
    writeStoredSessionMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to /app after a successful login", async () => {
    readStoredSessionMock.mockReturnValue(null);

    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: {
            user: {
              id: "user-03",
              email: "planner@example.com",
              displayName: "Planner",
              createdAt: "2026-04-18T00:00:00.000Z",
              updatedAt: "2026-04-18T00:00:00.000Z",
            },
            tokens: {
              tokenType: "Bearer",
              accessToken: "access-token-login",
              accessTokenExpiresIn: 900,
              refreshToken: "refresh-token-login-12345678901234567890",
              refreshTokenExpiresIn: 604800,
            },
          },
        },
      }),
    );

    renderWithProviders(["/auth/login"]);

    await userEvent.type(
      await screen.findByLabelText(/email/i),
      "planner@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/mật khẩu|password/i),
      "Password123",
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: /đăng nhập/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Protected Workspace",
      }),
    ).toBeInTheDocument();

    expect(writeStoredSessionMock).toHaveBeenCalledWith({
      user: {
        id: "user-03",
        email: "planner@example.com",
        displayName: "Planner",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token-login",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-login-12345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });
  });

  it("redirects unauthenticated users to login when they open a protected route directly", async () => {
    readStoredSessionMock.mockReturnValue(null);

    renderWithProviders(["/app/trips"]);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).toBeInTheDocument();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the user to the originally requested protected route after login", async () => {
    readStoredSessionMock.mockReturnValue(null);

    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: {
            user: {
              id: "user-05",
              email: "navigator@example.com",
              displayName: "Navigator",
              createdAt: "2026-04-20T00:00:00.000Z",
              updatedAt: "2026-04-20T00:00:00.000Z",
            },
            tokens: {
              tokenType: "Bearer",
              accessToken: "access-token-target-route",
              accessTokenExpiresIn: 900,
              refreshToken: "refresh-token-target-route-12345678901234567890",
              refreshTokenExpiresIn: 604800,
            },
          },
        },
      }),
    );

    renderWithProviders(["/app/trips"]);

    await userEvent.type(
      await screen.findByLabelText(/email/i),
      "navigator@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/mật khẩu|password/i),
      "Password123",
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: /đăng nhập/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Trips Workspace",
      }),
    ).toBeInTheDocument();
  });

  it("redirects authenticated users away from auth routes without looping back into /auth", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-06",
        email: "already-in@example.com",
        displayName: "Already In",
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-20T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token-authenticated",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-authenticated-12345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });

    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: {
            user: {
              id: "user-06",
              email: "already-in@example.com",
              displayName: "Already In",
              createdAt: "2026-04-20T00:00:00.000Z",
              updatedAt: "2026-04-20T00:00:00.000Z",
            },
          },
        },
      }),
    );

    renderWithProviders([
      {
        pathname: "/auth/login",
        state: {
          from: {
            pathname: "/auth/login",
          },
        },
      },
    ]);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Protected Workspace",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps a protected route on the booting shell while restoring a stored session", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-08",
        email: "booting@example.com",
        displayName: "Booting User",
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-20T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token-booting",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-booting-12345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });

    let resolveCurrentUserResponse:
      | ((response: Response) => void)
      | undefined;

    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveCurrentUserResponse = resolve;
      }),
    );

    renderWithProviders(["/app/trips"]);

    expect(
      await screen.findByText("Journey đang khôi phục phiên đăng nhập..."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).not.toBeInTheDocument();

    resolveCurrentUserResponse?.(
      createMockResponse({
        body: {
          success: true,
          data: {
            user: {
              id: "user-08",
              email: "booting@example.com",
              displayName: "Booting User",
              createdAt: "2026-04-20T00:00:00.000Z",
              updatedAt: "2026-04-20T00:00:00.000Z",
            },
          },
        },
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Trips Workspace",
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("logs the user out through the API and clears the local session", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-01",
        email: "traveler@example.com",
        displayName: "Traveler",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-123456789012345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });

    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              user: {
                id: "user-01",
                email: "traveler@example.com",
                displayName: "Traveler",
                createdAt: "2026-04-18T00:00:00.000Z",
                updatedAt: "2026-04-18T00:00:00.000Z",
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              loggedOut: true,
            },
          },
        }),
      );

    renderWithProviders(["/app"]);

    const logoutButton = await screen.findByRole("button", {
      name: /đăng xuất/i,
    });

    await userEvent.click(logoutButton);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Bạn đã đăng xuất khỏi Journey."),
    ).toBeInTheDocument();

    expect(clearStoredSessionMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          refreshToken: "refresh-token-123456789012345678901234567890",
        }),
      }),
    );
  });

  it("returns users to the auth flow with a notice after logout from a nested protected route", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-07",
        email: "reroute@example.com",
        displayName: "Re Route",
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-20T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "access-token-reroute",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-reroute-123456789012345678901234",
        refreshTokenExpiresIn: 604800,
      },
    });

    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              user: {
                id: "user-07",
                email: "reroute@example.com",
                displayName: "Re Route",
                createdAt: "2026-04-20T00:00:00.000Z",
                updatedAt: "2026-04-20T00:00:00.000Z",
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              loggedOut: true,
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              user: {
                id: "user-07",
                email: "reroute@example.com",
                displayName: "Re Route",
                createdAt: "2026-04-20T00:00:00.000Z",
                updatedAt: "2026-04-20T00:00:00.000Z",
              },
              tokens: {
                tokenType: "Bearer",
                accessToken: "access-token-reroute-next",
                accessTokenExpiresIn: 900,
                refreshToken: "refresh-token-reroute-next-1234567890123456",
                refreshTokenExpiresIn: 604800,
              },
            },
          },
        }),
      );

    renderWithProviders(["/app/trips"]);

    const logoutButton = await screen.findByRole("button", {
      name: /đăng xuất/i,
    });

    await userEvent.click(logoutButton);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bạn đã đăng xuất khỏi Journey."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: "Trips Workspace",
      }),
    ).not.toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "reroute@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/mật khẩu|password/i),
      "Password123",
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: /đăng nhập/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Trips Workspace",
      }),
    ).toBeInTheDocument();
  });

  it("clears the session and redirects to login when refresh fails during boot", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-02",
        email: "expired@example.com",
        displayName: "Expired User",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "expired-access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "expired-refresh-token-12345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });

    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          body: {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Token has expired.",
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          body: {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Refresh token is invalid.",
            },
          },
        }),
      );

    renderWithProviders(["/app"]);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(clearStoredSessionMock).toHaveBeenCalled();
    });
  });

  it("restores the protected session when token refresh succeeds during boot", async () => {
    readStoredSessionMock.mockReturnValue({
      user: {
        id: "user-04",
        email: "restored@example.com",
        displayName: "Restored User",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "expired-access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-restored-12345678901234567890",
        refreshTokenExpiresIn: 604800,
      },
    });

    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          body: {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Token has expired.",
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              tokens: {
                tokenType: "Bearer",
                accessToken: "restored-access-token",
                accessTokenExpiresIn: 900,
                refreshToken: "refresh-token-restored-next-1234567890123",
                refreshTokenExpiresIn: 604800,
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              user: {
                id: "user-04",
                email: "restored@example.com",
                displayName: "Restored User",
                createdAt: "2026-04-18T00:00:00.000Z",
                updatedAt: "2026-04-18T00:00:00.000Z",
              },
            },
          },
        }),
      );

    renderWithProviders(["/app"]);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Protected Workspace",
      }),
    ).toBeInTheDocument();

    expect(clearStoredSessionMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/auth/refresh"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          refreshToken: "refresh-token-restored-12345678901234567890",
        }),
      }),
    );
    expect(writeStoredSessionMock).toHaveBeenCalledWith({
      user: {
        id: "user-04",
        email: "restored@example.com",
        displayName: "Restored User",
        createdAt: "2026-04-18T00:00:00.000Z",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
      tokens: {
        tokenType: "Bearer",
        accessToken: "restored-access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token-restored-next-1234567890123",
        refreshTokenExpiresIn: 604800,
      },
    });
  });
});
