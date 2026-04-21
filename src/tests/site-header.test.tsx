import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LanguageProvider } from '@/shared/i18n/language-provider';
import { SiteHeader } from '@/shared/ui/site-header';

function renderSiteHeader() {
  render(
    <LanguageProvider>
      <MemoryRouter initialEntries={['/']}>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<div>Explore page</div>} />
          <Route path="/trips" element={<div>Public trips page</div>} />
          <Route path="/community" element={<div>Community page</div>} />
          <Route path="/auth/login" element={<div>Login page</div>} />
          <Route path="/auth/register" element={<div>Register page</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('Site header mobile navigation', () => {
  it('closes the mobile navigation when Escape is pressed', async () => {
    renderSiteHeader();

    const user = userEvent.setup();
    const toggle = screen.getByRole('button', {
      name: /mở hoặc đóng điều hướng|open or close navigation/i,
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile navigation after route changes', async () => {
    renderSiteHeader();

    const user = userEvent.setup();
    const toggle = screen.getByRole('button', {
      name: /mở hoặc đóng điều hướng|open or close navigation/i,
    });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getAllByRole('link', { name: /cộng đồng|community/i })[0]);

    expect(screen.getByText('Community page')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
