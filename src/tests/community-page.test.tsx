import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommunityPage } from '@/features/community/routes/community-page';
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
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('Community page', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the community feed with real posts', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: [
            {
              id: 'post-1',
              userId: 'user-1',
              tripId: 'trip-1',
              title: 'Ba ngày nhẹ hơn ở Hoi An',
              content:
                'Mình giữ nhịp rất chậm, chỉ chốt vài điểm chính và để lại nhiều khoảng thở.',
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

    renderWithProviders(['/community']);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /những câu chuyện đang được chia sẻ/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ba ngày nhẹ hơn ở Hoi An'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hiện có 1 câu chuyện công khai đang mở.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /mở chuyến đi được gắn kèm/i,
      }),
    ).toHaveAttribute('href', '/trips/trip-1');
  });

  it('renders the empty state when there are no community posts yet', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: [],
          meta: {
            page: 0,
            size: 12,
            sort: 'createdAt,desc',
            totalElements: 0,
            totalPages: 0,
          },
        },
      }),
    );

    renderWithProviders(['/community']);

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Cộng đồng đang chờ câu chuyện đầu tiên',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hãy mở một bài viết đầu tiên để cộng đồng có thêm một góc nhìn thực tế từ hành trình của bạn.',
      ),
    ).toBeInTheDocument();
  });
});
