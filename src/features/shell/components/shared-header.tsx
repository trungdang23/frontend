import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
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
  const { t } = useI18n();

  return (
    <header className="pointer-events-none z-[100] flex w-full flex-none items-start justify-center px-3 pt-3 sm:px-4">
      <nav
        aria-label={t('home.navigation.ariaLabel')}
        className="pointer-events-auto w-full pb-2"
      >
        <ul className="grid w-full grid-cols-5 items-start gap-1 sm:gap-1.5 md:flex md:justify-center md:gap-4">
          {homeNavItems.map((item, index) => (
            <li className="min-w-0 md:flex-none" key={item.labelKey}>
              <NavLink
                className="nav-note-shell min-h-[3.05rem] w-full min-w-0 md:min-h-[4rem] md:w-auto md:min-w-[8rem]"
                end={item.href === '/'}
                style={
                  {
                    ['--note-offset' as string]: `${item.yOffset}px`,
                    ['--note-rotate' as string]: `${item.rotate}deg`,
                    ['--note-drop-delay' as string]: `${index * 100}ms`,
                  } as CSSProperties
                }
                to={item.href}
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
          ))}
        </ul>
      </nav>
    </header>
  );
}
