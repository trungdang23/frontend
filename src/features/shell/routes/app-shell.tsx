import { useEffect, useId, useState } from 'react';
import {
  BookOpenText,
  House,
  LogOut,
  Map,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { SkipLink } from '@/shared/ui/skip-link';

export function AppShell() {
  const auth = useAuth();
  const location = useLocation();
  const workspaceNavId = useId();
  const [workspaceNavOpenLocationKey, setWorkspaceNavOpenLocationKey] = useState<
    string | null
  >(null);
  const { t } = useI18n();
  const publicNavItems = [
    { label: t('common.navigation.explore'), to: '/' },
    { label: t('common.navigation.publicTrips'), to: '/trips' },
    { label: t('common.navigation.community'), to: '/community' },
  ];
  const workspaceNavItems = [
    { label: t('common.navigation.dashboard'), to: '/app', icon: House },
    {
      label: t('common.navigation.writeStory'),
      to: '/app/community/new',
      icon: BookOpenText,
    },
    { label: t('common.navigation.trips'), to: '/app/trips', icon: Map },
    { label: t('common.navigation.profile'), to: '/app/profile', icon: UserRound },
  ];
  const currentLocationKey =
    location.key || `${location.pathname}${location.search}${location.hash}`;
  const isWorkspaceNavOpen = workspaceNavOpenLocationKey === currentLocationKey;

  useEffect(() => {
    if (!isWorkspaceNavOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setWorkspaceNavOpenLocationKey(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWorkspaceNavOpen]);

  return (
    <div className="min-h-screen">
      <SkipLink />
      <header className="page-shell pt-5">
        <div className="glass-panel flex flex-col gap-4 rounded-[var(--radius-xl)] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div>
                <p className="headline text-3xl text-[var(--color-forest)]">
                  {t('shell.title')}
                </p>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  {t('shell.description', {
                    name: auth.user?.displayName || t('common.userFallback'),
                  })}
                </p>
              </div>

              <nav
                aria-label={t('common.navigation.publicLabel')}
                className="flex flex-wrap gap-2"
              >
                {publicNavItems.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition',
                        isActive
                          ? 'border-[rgba(84,107,65,0.28)] bg-[rgba(84,107,65,0.1)] text-[var(--color-forest)]'
                          : 'border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-forest)]',
                      )
                    }
                    end={item.to === '/'}
                    key={item.to}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <LanguageSwitcher />
              <Button onClick={auth.logout} variant="secondary">
                <span className="inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('common.actions.logout')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="page-shell space-y-4 py-8 lg:space-y-0">
        <div className="glass-panel rounded-[var(--radius-xl)] p-4 lg:hidden">
          <button
            aria-controls={workspaceNavId}
            aria-expanded={isWorkspaceNavOpen}
            className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white/72 px-4 py-3 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-forest)]"
            onClick={() =>
              setWorkspaceNavOpenLocationKey((currentValue) =>
                currentValue === currentLocationKey ? null : currentLocationKey,
              )
            }
            type="button"
          >
            <span>{t('common.navigation.workspaceToggle')}</span>
            {isWorkspaceNavOpen ? (
              <X className="h-4 w-4 text-[var(--color-forest)]" />
            ) : (
              <Menu className="h-4 w-4 text-[var(--color-forest)]" />
            )}
          </button>

          {isWorkspaceNavOpen ? (
            <div className="pt-3" id={workspaceNavId}>
              <WorkspaceNavLinks
                items={workspaceNavItems}
                label={t('common.navigation.workspaceLabel')}
                onNavigate={() => setWorkspaceNavOpenLocationKey(null)}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="glass-panel hidden rounded-[var(--radius-xl)] p-4 lg:block">
            <WorkspaceNavLinks
              items={workspaceNavItems}
              label={t('common.navigation.workspaceLabel')}
            />
          </aside>

          <main className="pb-10" id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

type WorkspaceNavItem = {
  label: string;
  to: string;
  icon: typeof House;
};

function WorkspaceNavLinks({
  items,
  label,
  onNavigate,
}: {
  items: WorkspaceNavItem[];
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-[rgba(84,107,65,0.12)] text-[var(--color-forest)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-forest)]',
              )
            }
            end={item.to === '/app'}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
