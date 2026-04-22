import { PropsWithChildren } from 'react';
import {
  Compass,
  MapPinned,
  Plane,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

type PrivatePageShellProps = PropsWithChildren<{
  active: 'planner' | 'profile';
  description: string;
  eyebrow: string;
  title: string;
}>;

const privateNavItems = [
  {
    id: 'planner',
    href: '/app/planner',
    labelKey: 'home.navigation.planner',
  },
  {
    id: 'profile',
    href: '/app/profile',
    labelKey: 'home.navigation.profile',
  },
] as const;

export function PrivatePageShell({
  active,
  children,
  description,
  eyebrow,
  title,
}: PrivatePageShellProps) {
  const auth = useAuth();
  const { t } = useI18n();

  return (
    <main className="page-backdrop relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <Compass
          className="absolute left-[6%] top-[18%] hidden text-[#bb9764]/45 lg:block"
          size={88}
          strokeWidth={1.35}
        />
        <Plane
          className="absolute right-[11%] top-[12%] hidden rotate-[8deg] text-[#837766]/40 lg:block"
          size={56}
          strokeWidth={1.35}
        />
        <MapPinned
          className="absolute bottom-[13%] left-[10%] hidden -rotate-[10deg] text-[#c77c60]/35 lg:block"
          size={48}
          strokeWidth={1.35}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="glass-panel flex flex-wrap items-center gap-2 rounded-[1.6rem] p-2">
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:bg-white/55 hover:text-[var(--color-ink)]"
              to="/"
            >
              {t('home.navigation.home')}
            </Link>

            {privateNavItems.map((item) => (
              <Link
                className={cn(
                  'rounded-full px-4 py-2 font-hand text-[1.55rem] leading-none transition',
                  active === item.id
                    ? 'bg-[#fff5e2] text-[#3a261a] shadow-[0_10px_18px_rgba(83,62,44,0.14)]'
                    : 'text-[#725444] hover:bg-white/55 hover:text-[#3a261a]',
                )}
                key={item.id}
                to={item.href}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <button
            className="auth-stamp-button auth-stamp-button--small self-end sm:self-auto"
            onClick={() => {
              void auth.logout();
            }}
            type="button"
          >
            {t('common.actions.logout')}
          </button>
        </div>

        <section className="paper-panel overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-5">
              <p className="section-label">{eyebrow}</p>

              <div className="space-y-3">
                <h1 className="font-display text-[2.3rem] leading-tight text-[#2c1f18] sm:text-[3.1rem]">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
                  {description}
                </p>
              </div>

              {children}
            </div>

            <aside className="rounded-[1.8rem] border border-[#bc956f]/26 bg-[linear-gradient(180deg,rgba(255,252,244,0.96),rgba(248,238,216,0.94))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_32px_rgba(96,72,50,0.1)]">
              <p className="font-hand text-[2rem] leading-none text-[#7a4b39] sm:text-[2.45rem]">
                {t('shell.title')}
              </p>

              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                {t('shell.description', {
                  name: auth.user?.displayName || t('common.userFallback'),
                })}
              </p>

              <dl className="mt-6 space-y-4">
                <div className="rounded-[1.2rem] bg-white/62 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                    {t('auth.register.nameLabel')}
                  </dt>
                  <dd className="mt-2 font-marker text-[1.45rem] text-[#37261e]">
                    {auth.user?.displayName || t('common.userFallback')}
                  </dd>
                </div>

                <div className="rounded-[1.2rem] bg-white/62 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                    {t('common.labels.email')}
                  </dt>
                  <dd className="mt-2 break-all font-marker text-[1.25rem] text-[#37261e]">
                    {auth.user?.email || '-'}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

