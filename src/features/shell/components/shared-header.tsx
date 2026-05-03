import type { CSSProperties } from 'react';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';
import { homeNavItems } from '@/features/shell/content/public-chrome-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const noteToneClasses = {
  coral: 'bg-[#f87171] text-[#4b2c22]',
  leaf: 'bg-[#4ade80] text-[#1f3523]',
  paper: 'bg-[#fffdf7] text-[#4a3b31]',
  sky: 'bg-[#7dd3fc] text-[#244357]',
  sun: 'bg-[#fcd34d] text-[#553b10]',
} as const;

const noteShapeClasses = {
  'fold-left': 'nav-note--fold-left',
  'fold-right': 'nav-note--fold-right',
  notebook: 'nav-note--notebook',
  straight: 'nav-note--straight',
  'torn-bottom': 'nav-note--torn-bottom',
} as const;

const noteHoverClasses = [
  'nav-note--hover-bob',
  'nav-note--hover-wobble',
  'nav-note--hover-peel',
  'nav-note--hover-swivel',
  'nav-note--hover-bloom',
] as const;

export function SharedHeader() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await auth.logout();
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="pointer-events-none z-[100] flex w-full flex-none flex-col items-stretch gap-1 px-3 pt-3 sm:px-4 md:gap-0">
      <nav
        aria-label={t('home.navigation.ariaLabel')}
        className="pointer-events-auto w-full pb-2"
      >
        <ul className="grid w-full grid-cols-5 items-start gap-1 sm:gap-1.5 md:flex md:justify-center md:gap-4">
          {homeNavItems.map((item, index) => {
            const isProtectedPlanner = item.href === '/app/planner';
            const isProtectedWorkspace = item.href.startsWith('/app/');
            const navTarget = isProtectedWorkspace && auth.status !== 'authenticated'
              ? '/auth/login'
              : isProtectedPlanner
                ? '/app/planner'
                : item.href;
            const navState = isProtectedWorkspace && auth.status !== 'authenticated'
              ? { from: { pathname: item.href } }
              : undefined;

            return (
              <li className="min-w-0 md:flex-none" key={item.labelKey}>
                <NavLink
                  className="nav-note-shell min-h-[3.05rem] w-full min-w-0 md:min-h-[4rem] md:w-auto md:min-w-[8rem]"
                  end={item.href === '/'}
                  state={navState}
                  style={
                    {
                      ['--note-offset' as string]: `${item.yOffset}px`,
                      ['--note-rotate' as string]: `${item.rotate}deg`,
                      ['--note-drop-delay' as string]: `${index * 100}ms`,
                    } as CSSProperties
                  }
                  to={navTarget}
                >
                  {({ isActive }) => (
                    <span
                      className={cn(
                        'nav-note min-h-[3.05rem] w-full min-w-0 px-1.5 py-1.5 text-[0.8rem] leading-[0.9] md:min-h-[4rem] md:px-5 md:py-2 md:text-[1.6rem]',
                        noteToneClasses[item.tone],
                        noteShapeClasses[item.shape],
                        noteHoverClasses[index % noteHoverClasses.length],
                        isActive && 'brightness-[1.03] saturate-[1.08] shadow-[0_22px_34px_rgba(98,74,51,0.2)]',
                      )}
                    >
                      <span className="relative z-10 text-center whitespace-normal md:whitespace-nowrap">
                        {t(item.labelKey)}
                      </span>
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {auth.status === 'authenticated' ? (
        <div className="pointer-events-auto flex w-full justify-end pb-2 md:absolute md:right-4 md:top-4 md:w-auto md:pb-0">
          <button
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-3 py-1.5 font-marker text-[0.82rem] font-bold leading-none text-[#6b3b18] shadow-[0_4px_0_#d7a957] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d7a957]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 md:px-4 md:text-[0.9rem]"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            type="button"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.3} />
            {t('common.actions.logout')}
          </button>
        </div>
      ) : null}
    </header>
  );
}
