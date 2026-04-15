import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { getButtonClasses } from '@/shared/ui/button-styles';

const navItems = [
  { label: 'Khám phá', to: '/' },
  { label: 'Cộng đồng', to: '/community' },
  { label: 'Đăng nhập', to: '/auth/login' },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="page-shell pt-5 sm:pt-7">
      <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
        <Link className="headline text-2xl text-[var(--color-forest)]" to="/">
          Journey
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[rgba(84,107,65,0.1)] text-[var(--color-forest)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-forest)]',
                )
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          <Link className={cn(getButtonClasses(), 'ml-2')} to="/auth/register">
            Bat dau
          </Link>
        </nav>

        <button
          aria-expanded={isOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-forest)] transition hover:bg-white/60 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>

      {isOpen ? (
        <div className="glass-panel mt-3 rounded-[var(--radius-lg)] p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-white/60 hover:text-[var(--color-forest)]"
                key={item.to}
                onClick={() => setIsOpen(false)}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              className="rounded-2xl bg-[var(--color-forest)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-forest-deep)]"
              onClick={() => setIsOpen(false)}
              to="/auth/register"
            >
              Bắt đầu
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
