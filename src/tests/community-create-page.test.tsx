import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommunityPostPage } from '@/features/community/routes/community-post-page';
import { CommunityCreatePage } from '@/features/community/routes/community-create-page';
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
      mutations: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/app/community/new" element={<CommunityCreatePage />} />
            <Route path="/community/:postId" element={<CommunityPostPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('Community create page', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a post and redirects to its detail route', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            success: true,
            data: [
              {
                id: 'trip-1',
                userId: 'user-1',
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
          status: 201,
          body: {
            success: true,
            data: {
              id: 'post-created',
              userId: 'user-1',
              tripId: 'trip-1',
              title: 'Hoi An under slower light',
              content: 'Mình giữ lịch mỏng để có nhiều đoạn thở hơn.',
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
          },
        }),
      );

    renderWithProviders(['/app/community/new?tripId=trip-1']);

    await userEvent.type(
      await screen.findByLabelText('Tiêu đề bài viết'),
      'Hoi An under slower light',
    );
    await userEvent.type(
      screen.getByLabelText('Nội dung'),
      'Mình giữ lịch mỏng để có nhiều đoạn thở hơn.',
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: /đăng bài viết/i,
      }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/posts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'Hoi An under slower light',
            content: 'Mình giữ lịch mỏng để có nhiều đoạn thở hơn.',
            coverImageUrl: null,
            tripId: 'trip-1',
          }),
        }),
      );
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Hoi An under slower light',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Bài viết cộng đồng đã được đăng thành công.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen
          .getByText('Bài viết cộng đồng đã được đăng thành công.')
          .closest('[role="status"]'),
      ).toHaveFocus();
    });
  });

  it('shows a warning when the requested trip is private', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        body: {
          success: true,
          data: [
            {
              id: 'trip-private',
              userId: 'user-1',
              name: 'Private Hue Notes',
              destination: null,
              summaryNotes: null,
              coverImageUrl: null,
              startDate: '2026-08-02',
              endDate: '2026-08-05',
              timezone: null,
              budgetMode: 'auto',
              manualBudgetAmount: null,
              manualBudgetCurrency: null,
              visibility: 'private',
              budgetAmount: 0,
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
    );

    renderWithProviders(['/app/community/new?tripId=trip-private']);

    expect(
      await screen.findByText(
        'Chuyến đi được chọn vẫn đang ở chế độ riêng tư. Hãy chuyển trip sang public trước khi gắn vào bài viết.',
      ),
    ).toBeInTheDocument();
  });
});
