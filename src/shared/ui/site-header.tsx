import { useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { SkipLink } from '@/shared/ui/skip-link';

export function SiteHeader() {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const location = useLocation();
  const mobileMenuId = useId();
  const { t } = useI18n();
  const navItems = [
    { label: t('common.navigation.explore'), to: '/' },
    { label: t('common.navigation.publicTrips'), to: '/trips' },
    { label: t('common.navigation.community'), to: '/community' },
    { label: t('common.navigation.login'), to: '/auth/login' },
  ];

  const isOpen = openPath === location.pathname;

  return (
    <>
      <SkipLink />
      <header className="page-shell pt-5 sm:pt-7">
        <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Link className="headline text-2xl text-[var(--color-forest)]" to="/">
            {t('common.brand')}
          </Link>

          <nav
            aria-label={t('common.navigation.publicLabel')}
            className="hidden items-center gap-2 md:flex"
          >
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
            <LanguageSwitcher />
            <Link className={cn(getButtonClasses(), 'ml-2')} to="/auth/register">
              {t('common.navigation.getStarted')}
            </Link>
          </nav>

          <button
            aria-controls={mobileMenuId}
            aria-expanded={isOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-forest)] transition hover:bg-white/60 md:hidden"
            onClick={() =>
              setOpenPath((currentValue) =>
                currentValue === location.pathname ? null : location.pathname,
              )
            }
            type="button"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">{t('common.navigation.toggle')}</span>
          </button>
        </div>

        {isOpen ? (
          <div className="glass-panel mt-3 rounded-[var(--radius-lg)] p-4 md:hidden" id={mobileMenuId}>
            <div className="flex flex-col gap-2">
              <div className="pb-2">
                <LanguageSwitcher />
              </div>
              {navItems.map((item) => (
                <NavLink
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-white/60 hover:text-[var(--color-forest)]"
                  key={item.to}
                  onClick={() => setOpenPath(null)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                className="rounded-2xl bg-[var(--color-forest)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-forest-deep)]"
                onClick={() => setOpenPath(null)}
                to="/auth/register"
              >
                {t('common.navigation.getStarted')}
              </Link>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
