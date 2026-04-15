import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appRoutes } from '@/app/router/app-routes';
import { AuthProvider } from '@/features/auth/session/auth-context';

function renderWithProviders(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createMemoryRouter(appRoutes, {
    initialEntries,
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('Landing page', () => {
  it('renders the planning-aligned hero content', async () => {
    renderWithProviders(['/']);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Journey giúp bạn gom cảm hứng/i,
      }),
    ).toBeInTheDocument();
  });
});
