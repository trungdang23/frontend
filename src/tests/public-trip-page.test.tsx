import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicTripPage } from '@/features/trips/public/routes/public-trip-page';
import { LanguageProvider } from '@/shared/i18n/language-provider';

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

function renderWithProviders(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/trips/:tripId" element={<PublicTripPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('Public trip page', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the public trip detail and read-only planner', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              id: 'trip-public',
              userId: 'user-01',
              name: 'Hoi An Riverside Notes',
              destination: null,
              summaryNotes: 'Ba ngày chậm rãi, ưu tiên dạo sông và quán cafe.',
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
          },
        }),
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: {
              trip: {
                id: 'trip-public',
                userId: 'user-01',
                name: 'Hoi An Riverside Notes',
                destination: null,
                summaryNotes: 'Ba ngày chậm rãi, ưu tiên dạo sông và quán cafe.',
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
              nodes: [
                {
                  id: 'node-root',
                  tripId: 'trip-public',
                  parentId: null,
                  type: 'day',
                  title: 'Ngày 1: Đến Hội An',
                  notes: 'Đi bộ quanh phố cổ trước khi lên lịch dày hơn.',
                  startAt: '2026-07-12T09:00:00.000Z',
                  endAt: '2026-07-12T20:00:00.000Z',
                  costAmount: 500000,
                  costCurrency: 'VND',
                  imageUrl: null,
                  sortOrder: 0,
                  depth: 0,
                  createdAt: '2026-04-18T00:00:00.000Z',
                  updatedAt: '2026-04-18T00:00:00.000Z',
                },
              ],
            },
          },
        }),
      );

    renderWithProviders(['/trips/trip-public']);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /hoi an riverside notes/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Ngày 1: Đến Hội An'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Planner ở route công khai đang là read-only. Mọi thao tác chỉnh sửa vẫn nằm trong workspace riêng của chủ chuyến đi.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the private-trip state for a 403 response', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Trip is private.',
          },
        },
        status: 403,
      }),
    );

    renderWithProviders(['/trips/trip-private']);

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Chuyến đi này đang ở chế độ riêng tư',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Chủ sở hữu chưa mở quyền xem công khai cho route này. Hãy đăng nhập nếu bạn nghĩ mình cần quyền truy cập.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the not-found state for a 404 response', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Trip not found.',
          },
        },
        status: 404,
      }),
    );

    renderWithProviders(['/trips/trip-missing']);

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Không tìm thấy chuyến đi công khai này',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Link có thể không còn hợp lệ hoặc chuyến đi đã bị xoá.',
      ),
    ).toBeInTheDocument();
  });
});
