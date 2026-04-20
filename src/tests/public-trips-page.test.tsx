import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicTripsPage } from '@/features/trips/public/routes/public-trips-page';
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
            <Route path="/trips" element={<PublicTripsPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('Public trips page', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the public trip list for guests', async () => {
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
            {
              id: 'trip-public-2',
              userId: 'user-02',
              name: 'Da Lat Coffee Run',
              destination: null,
              summaryNotes: 'Ưu tiên cafe, chợ đêm và ảnh sáng sớm.',
              coverImageUrl: null,
              startDate: '2026-08-02',
              endDate: '2026-08-05',
              timezone: null,
              budgetAmount: 2800000,
              budgetCurrency: 'VND',
              budgetMode: 'manual',
              manualBudgetAmount: 2800000,
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
            totalElements: 2,
            totalPages: 1,
          },
        },
      }),
    );

    renderWithProviders(['/trips']);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /danh sách các chuyến đi đang được chia sẻ/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Hoi An Slow Days')).toBeInTheDocument();
    expect(screen.getByText('Da Lat Coffee Run')).toBeInTheDocument();
    expect(screen.getByText('Hiện có 2 chuyến đi public đang mở.')).toBeInTheDocument();
  });
});
