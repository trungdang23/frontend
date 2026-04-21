import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/features/auth/session/auth-context-value';
import { AppShell } from '@/features/shell/routes/app-shell';
import { LanguageProvider } from '@/shared/i18n/language-provider';

const authenticatedAuthContext = {
  status: 'authenticated' as const,
  notice: null,
  noticeTone: 'info' as const,
  user: {
    id: 'user-shell-01',
    email: 'traveler@example.com',
    displayName: 'Traveler',
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
  },
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn(),
  clearNotice: vi.fn(),
};

function renderAppShell() {
  render(
    <LanguageProvider>
      <AuthContext.Provider value={authenticatedAuthContext}>
        <MemoryRouter initialEntries={['/app']}>
          <Routes>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<div>Dashboard workspace</div>} />
              <Route path="profile" element={<div>Profile workspace</div>} />
            </Route>
            <Route path="/" element={<div>Explore page</div>} />
            <Route path="/trips" element={<div>Public trips page</div>} />
            <Route path="/community" element={<div>Community page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </LanguageProvider>,
  );
}

describe('App shell public navigation', () => {
  it('exposes an accessible workspace menu toggle state', async () => {
    renderAppShell();

    const user = userEvent.setup();
    const toggle = screen.getByRole('button', {
      name: /mở hoặc đóng menu không gian riêng|open or close the workspace menu/i,
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the mobile workspace menu when Escape is pressed', async () => {
    renderAppShell();

    const user = userEvent.setup();
    const toggle = screen.getByRole('button', {
      name: /mở hoặc đóng menu không gian riêng|open or close the workspace menu/i,
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile workspace menu after navigation inside the app shell', async () => {
    renderAppShell();

    const user = userEvent.setup();
    const toggle = screen.getByRole('button', {
      name: /mở hoặc đóng menu không gian riêng|open or close the workspace menu/i,
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getAllByRole('link', { name: /hồ sơ|profile/i })[0]);

    expect(screen.getByText('Profile workspace')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps public quick links visible for authenticated users', () => {
    renderAppShell();

    expect(
      screen.getByRole('link', { name: /khám phá|explore/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /chuyến đi public|public trips/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /cộng đồng|community/i }),
    ).toBeInTheDocument();
  });

  it.each([
    {
      linkName: /khám phá|explore/i,
      pageText: 'Explore page',
    },
    {
      linkName: /chuyến đi public|public trips/i,
      pageText: 'Public trips page',
    },
    {
      linkName: /cộng đồng|community/i,
      pageText: 'Community page',
    },
  ])(
    'navigates authenticated users from app shell to $pageText',
    async ({ linkName, pageText }) => {
      renderAppShell();

      await userEvent.click(screen.getByRole('link', { name: linkName }));

      expect(screen.getByText(pageText)).toBeInTheDocument();
    },
  );
});
