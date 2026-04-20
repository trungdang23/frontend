import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { useMemo, useState, type PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectedLayout } from '@/app/router/protected-layout';
import { PublicAuthLayout } from '@/app/router/public-auth-layout';
import { LoginPage } from '@/features/auth/routes/login-page';
import { AuthContext } from '@/features/auth/session/auth-context-value';
import { CommunityCreatePage } from '@/features/community/routes/community-create-page';
import { CommunityPage } from '@/features/community/routes/community-page';
import { CommunityPostPage } from '@/features/community/routes/community-post-page';
import { PublicTripPage } from '@/features/trips/public/routes/public-trip-page';
import { PublicTripsPage } from '@/features/trips/public/routes/public-trips-page';
import { TripDetailPage } from '@/features/trips/routes/trip-detail-page';
import { LanguageProvider } from '@/shared/i18n/language-provider';
import type { User } from '@/shared/types/user';

type MockResponseOptions = {
  body: unknown;
  status?: number;
};

type TestAuthProviderProps = PropsWithChildren<{
  initialStatus?: 'guest' | 'authenticated';
  initialUser?: User | null;
}>;

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

const defaultAuthenticatedUser: User = {
  id: 'user-routing-01',
  email: 'routing@example.com',
  displayName: 'Routing User',
  createdAt: '2026-04-20T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
};

function TestAuthProvider({
  children,
  initialStatus = 'guest',
  initialUser = initialStatus === 'authenticated'
    ? defaultAuthenticatedUser
    : null,
}: TestAuthProviderProps) {
  const [status, setStatus] = useState(initialStatus);
  const [user, setUser] = useState<User | null>(initialUser);

  const value = useMemo(
    () => ({
      status,
      notice: null,
      noticeTone: 'info' as const,
      user,
      async login() {
        setUser(defaultAuthenticatedUser);
        setStatus('authenticated');
      },
      async logout() {
        setUser(null);
        setStatus('guest');
      },
      async register() {
        setUser(defaultAuthenticatedUser);
        setStatus('authenticated');
      },
      clearNotice() {},
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function renderAppWithProviders({
  initialEntries,
  initialStatus = 'guest',
  initialUser,
}: {
  initialEntries: string[];
  initialStatus?: 'guest' | 'authenticated';
  initialUser?: User | null;
}) {
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
        <TestAuthProvider
          initialStatus={initialStatus}
          initialUser={initialUser}
        >
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path="/auth" element={<PublicAuthLayout />}>
                <Route path="login" element={<LoginPage />} />
              </Route>
              <Route path="/community">
                <Route index element={<CommunityPage />} />
                <Route path=":postId" element={<CommunityPostPage />} />
              </Route>
              <Route path="/trips">
                <Route index element={<PublicTripsPage />} />
                <Route path=":tripId" element={<PublicTripPage />} />
              </Route>
              <Route path="/app" element={<ProtectedLayout />}>
                <Route path="community/new" element={<CommunityCreatePage />} />
                <Route path="trips/:tripId" element={<TripDetailPage />} />
              </Route>
              <Route path="*" element={<Navigate replace to="/auth/login" />} />
            </Routes>
          </MemoryRouter>
        </TestAuthProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('App routing integration', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the public trips route from the app route tree for guests', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: [
            {
              id: 'trip-public-1',
              userId: 'user-01',
              name: 'Hoi An Slow Days',
              destination: null,
              summaryNotes: 'Ba ngày nhẹ nhàng gần phố cổ.',
              coverImageUrl: null,
              startDate: '2026-07-12',
              endDate: '2026-07-15',
              timezone: null,
              budgetAmount: 3500000,
              budgetCurrency: 'VND',
              budgetMode: 'manual',
              manualBudgetAmount: 3500000,
              manualBudgetCurrency: 'VND',
              visibility: 'public',
              createdAt: '2026-04-18T00:00:00.000Z',
              updatedAt: '2026-04-18T00:00:00.000Z',
            },
          ],
          meta: {
            page: 0,
            size: 20,
            sort: 'startDate,asc',
            totalElements: 1,
            totalPages: 1,
          },
        },
      }),
    );

    renderAppWithProviders({
      initialEntries: ['/trips'],
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /danh sách các chuyến đi đang được chia sẻ/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hoi An Slow Days')).toBeInTheDocument();
  });

  it('renders the public community detail route from the app route tree for guests', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: {
            id: 'post-1',
            userId: 'user-1',
            tripId: 'trip-1',
            title: 'Da Lat mornings and quiet nights',
            content:
              'Mình dành nhiều thời gian cho cafe sáng, chợ đêm và vài đoạn đi bộ không lên lịch.',
            coverImageUrl: null,
            visibility: 'public',
            createdAt: '2026-04-20T00:00:00.000Z',
            updatedAt: '2026-04-20T00:00:00.000Z',
            author: {
              id: 'user-1',
              displayName: 'Trung',
            },
            trip: {
              id: 'trip-1',
              name: 'Da Lat Coffee Run',
              coverImageUrl: null,
            },
          },
        },
      }),
    );

    renderAppWithProviders({
      initialEntries: ['/community/post-1'],
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /da lat mornings and quiet nights/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /mở chuyến đi được gắn kèm/i,
      }),
    ).toHaveAttribute('href', '/trips/trip-1');
  });

  it('redirects guests to the login page when they open a protected trip route from the app route tree', async () => {
    renderAppWithProviders({
      initialEntries: ['/app/trips/trip-owner-1'],
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /trở lại với hành trình đang dang dở/i,
      }),
    ).toBeInTheDocument();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns users to the requested trip route after login through the app route tree', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              id: 'trip-owner-1',
              userId: 'user-routing-01',
              name: 'Hue Planner Workspace',
              destination: null,
              summaryNotes: 'Planner route được mở lại sau login.',
              coverImageUrl: null,
              startDate: '2026-09-01',
              endDate: '2026-09-04',
              timezone: null,
              budgetAmount: 4200000,
              budgetCurrency: 'VND',
              budgetMode: 'manual',
              manualBudgetAmount: 4200000,
              manualBudgetCurrency: 'VND',
              visibility: 'private',
              createdAt: '2026-04-20T00:00:00.000Z',
              updatedAt: '2026-04-20T00:00:00.000Z',
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              tripId: 'trip-owner-1',
              currency: 'VND',
              totalBudgetAmount: 4200000,
              totalPlannedAmount: 600000,
              totalDays: 1,
              totalActivities: 1,
              hasMixedCurrencies: false,
              totalsByCurrency: [
                {
                  currency: 'VND',
                  plannedAmount: 600000,
                  nodeCount: 1,
                },
              ],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              trip: {
                id: 'trip-owner-1',
                userId: 'user-routing-01',
                name: 'Hue Planner Workspace',
                destination: null,
                summaryNotes: 'Planner route được mở lại sau login.',
                coverImageUrl: null,
                startDate: '2026-09-01',
                endDate: '2026-09-04',
                timezone: null,
                budgetAmount: 4200000,
                budgetCurrency: 'VND',
                budgetMode: 'manual',
                manualBudgetAmount: 4200000,
                manualBudgetCurrency: 'VND',
                visibility: 'private',
                createdAt: '2026-04-20T00:00:00.000Z',
                updatedAt: '2026-04-20T00:00:00.000Z',
              },
              nodes: [
                {
                  id: 'node-root',
                  tripId: 'trip-owner-1',
                  parentId: null,
                  type: 'day',
                  title: 'Ngày 1 ở Huế',
                  notes: 'Giữ planner mỏng trước khi mở rộng thêm.',
                  startAt: '2026-09-01T08:00:00.000Z',
                  endAt: '2026-09-01T20:00:00.000Z',
                  costAmount: 600000,
                  costCurrency: 'VND',
                  imageUrl: null,
                  sortOrder: 0,
                  depth: 0,
                  createdAt: '2026-04-20T00:00:00.000Z',
                  updatedAt: '2026-04-20T00:00:00.000Z',
                },
              ],
            },
          },
        }),
      );

    renderAppWithProviders({
      initialEntries: ['/app/trips/trip-owner-1'],
    });

    await userEvent.type(
      await screen.findByLabelText(/email/i),
      'routing@example.com',
    );
    await userEvent.type(
      screen.getByLabelText(/mật khẩu|password/i),
      'Password123',
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: /đăng nhập/i,
      }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /hue planner workspace/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Ngày 1 ở Huế')).toBeInTheDocument();
  });

  it('keeps the route back to public community available from the protected create-post flow', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: [
              {
                id: 'trip-public-1',
                userId: 'user-routing-01',
                name: 'Hoi An Slow Days',
                destination: null,
                summaryNotes: null,
                coverImageUrl: null,
                startDate: '2026-07-12',
                endDate: '2026-07-15',
                timezone: null,
                budgetMode: 'manual',
                manualBudgetAmount: 3500000,
                manualBudgetCurrency: 'VND',
                visibility: 'public',
                budgetAmount: 3500000,
                budgetCurrency: 'VND',
                createdAt: '2026-04-20T00:00:00.000Z',
                updatedAt: '2026-04-20T00:00:00.000Z',
              },
            ],
            meta: {
              page: 0,
              size: 100,
              sort: 'startDate,asc',
              totalElements: 1,
              totalPages: 1,
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: [
              {
                id: 'post-1',
                userId: 'user-routing-01',
                tripId: 'trip-public-1',
                title: 'Ba ngày nhẹ hơn ở Hoi An',
                content:
                  'Mình giữ nhịp rất chậm, chỉ chốt vài điểm chính và để lại nhiều khoảng thở.',
                coverImageUrl: null,
                visibility: 'public',
                createdAt: '2026-04-20T00:00:00.000Z',
                updatedAt: '2026-04-20T00:00:00.000Z',
                author: {
                  id: 'user-routing-01',
                  displayName: 'Routing User',
                },
                trip: {
                  id: 'trip-public-1',
                  name: 'Hoi An Slow Days',
                  coverImageUrl: null,
                },
              },
            ],
            meta: {
              page: 0,
              size: 12,
              sort: 'createdAt,desc',
              totalElements: 1,
              totalPages: 1,
            },
          },
        }),
      );

    renderAppWithProviders({
      initialEntries: ['/app/community/new'],
      initialStatus: 'authenticated',
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /chia sẻ một câu chuyện từ hành trình của bạn/i,
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('link', { name: /^cộng đồng$|^community$/i }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /những câu chuyện đang được chia sẻ/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ba ngày nhẹ hơn ở Hoi An'),
    ).toBeInTheDocument();
  });

  it('refreshes the budget summary after creating a planner node from the trip detail route', async () => {
    const tripId = 'trip-owner-budget-1';
    const tripDetail = {
      id: tripId,
      userId: 'user-routing-01',
      name: 'Hue Planner Workspace',
      destination: null,
      summaryNotes: 'Budget summary should stay in sync with planner mutations.',
      coverImageUrl: null,
      startDate: '2026-09-01',
      endDate: '2026-09-04',
      timezone: null,
      budgetAmount: 4200000,
      budgetCurrency: 'VND',
      budgetMode: 'manual',
      manualBudgetAmount: 4200000,
      manualBudgetCurrency: 'VND',
      visibility: 'private',
      createdAt: '2026-04-20T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
    };
    const rootNode = {
      id: 'node-root',
      tripId,
      parentId: null,
      type: 'day',
      title: 'Ngày 1 ở Huế',
      notes: 'Giữ planner mỏng trước khi mở rộng thêm.',
      startAt: '2026-09-01T08:00:00.000Z',
      endAt: '2026-09-01T20:00:00.000Z',
      costAmount: 600000,
      costCurrency: 'VND',
      imageUrl: null,
      sortOrder: 0,
      depth: 0,
      createdAt: '2026-04-20T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
    };
    const createdChildNode = {
      id: 'node-child',
      tripId,
      parentId: 'node-root',
      type: 'activity',
      title: 'Bữa tối sông Hương',
      notes: 'Khoá regression cho budget refetch.',
      startAt: '2026-09-01T19:00:00.000Z',
      endAt: '2026-09-01T21:00:00.000Z',
      costAmount: 200000,
      costCurrency: 'VND',
      imageUrl: null,
      sortOrder: 0,
      depth: 1,
      createdAt: '2026-04-20T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
    };

    let plannerRequestCount = 0;
    let budgetSummaryRequestCount = 0;

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method ?? 'GET';

      if (url.endsWith(`/trips/${tripId}`) && method === 'GET') {
        return createMockResponse({
          body: {
            success: true,
            data: tripDetail,
          },
        });
      }

      if (url.endsWith(`/trips/${tripId}/budget-summary`) && method === 'GET') {
        budgetSummaryRequestCount += 1;

        return createMockResponse({
          body: {
            success: true,
            data:
              budgetSummaryRequestCount === 1
                ? {
                    tripId,
                    currency: 'VND',
                    totalBudgetAmount: 4200000,
                    totalPlannedAmount: 600000,
                    remainingAmount: 3600000,
                    totalDays: 1,
                    totalActivities: 0,
                    isOverBudget: false,
                    hasMixedCurrencies: false,
                    totalsByCurrency: [
                      {
                        currency: 'VND',
                        plannedAmount: 600000,
                        nodeCount: 1,
                      },
                    ],
                  }
                : {
                    tripId,
                    currency: 'VND',
                    totalBudgetAmount: 4200000,
                    totalPlannedAmount: 800000,
                    remainingAmount: 3400000,
                    totalDays: 1,
                    totalActivities: 1,
                    isOverBudget: false,
                    hasMixedCurrencies: false,
                    totalsByCurrency: [
                      {
                        currency: 'VND',
                        plannedAmount: 800000,
                        nodeCount: 2,
                      },
                    ],
                  },
          },
        });
      }

      if (url.endsWith(`/trips/${tripId}/planner`) && method === 'GET') {
        plannerRequestCount += 1;

        return createMockResponse({
          body: {
            success: true,
            data: {
              trip: tripDetail,
              nodes:
                plannerRequestCount === 1
                  ? [rootNode]
                  : [rootNode, createdChildNode],
            },
          },
        });
      }

      if (url.endsWith('/nodes') && method === 'POST') {
        return createMockResponse({
          body: {
            success: true,
            data: createdChildNode,
          },
        });
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });

    renderAppWithProviders({
      initialEntries: [`/app/trips/${tripId}`],
      initialStatus: 'authenticated',
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /hue planner workspace/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Ngày 1 ở Huế')).toBeInTheDocument();

    await waitFor(() => {
      expect(budgetSummaryRequestCount).toBe(1);
      expect(plannerRequestCount).toBe(1);
    });

    await userEvent.click(
      screen.getByRole('button', { name: /thêm node con/i }),
    );
    await userEvent.type(
      screen.getByLabelText('Tên node'),
      createdChildNode.title,
    );
    await userEvent.selectOptions(screen.getByLabelText('Loại node'), 'activity');
    await userEvent.type(
      screen.getByLabelText('Thời gian bắt đầu'),
      '2026-09-01T19:00',
    );
    await userEvent.type(
      screen.getByLabelText('Thời gian kết thúc'),
      '2026-09-01T21:00',
    );
    await userEvent.type(
      screen.getByLabelText('Chi phí dự kiến'),
      '200000',
    );
    await userEvent.clear(screen.getByLabelText('Tiền tệ'));
    await userEvent.type(screen.getByLabelText('Tiền tệ'), 'VND');
    await userEvent.type(
      screen.getByLabelText('Ghi chú'),
      createdChildNode.notes,
    );
    await userEvent.click(screen.getByRole('button', { name: /lưu node/i }));

    expect(await screen.findByText(createdChildNode.title)).toBeInTheDocument();

    await waitFor(() => {
      expect(budgetSummaryRequestCount).toBe(2);
      expect(plannerRequestCount).toBe(2);
    });

    expect(await screen.findByText(/800\.000/)).toBeInTheDocument();
  });
});
