import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommunityPostPage } from '@/features/community/routes/community-post-page';
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
            <Route path="/community/:postId" element={<CommunityPostPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('Community post page', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem?.('journey.language');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the post detail with linked trip CTA', async () => {
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

    renderWithProviders(['/community/post-1']);

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
    expect(
      screen.getByRole('region', {
        name: /da lat coffee run/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the not-found state for a missing post', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        status: 404,
        body: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Post not found.',
          },
        },
      }),
    );

    renderWithProviders(['/community/post-missing']);

    const heading = await screen.findByRole('heading', {
      level: 2,
      name: 'Không tìm thấy bài viết này',
    });

    expect(heading).toBeInTheDocument();
    expect(
      screen.getByText(
        'Liên kết có thể không còn hợp lệ hoặc bài viết đã bị gỡ khỏi community.',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(heading).toHaveFocus());
  });
});
