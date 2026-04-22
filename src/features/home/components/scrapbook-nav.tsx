import type { CSSProperties } from 'react';
import { homeNavItems } from '@/features/home/content/home-content';
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

export function ScrapbookNav() {
  const { t } = useI18n();

  return (
    <header className="pointer-events-none sticky top-0 z-[100] mb-5 flex w-full items-start justify-center px-3 pt-3 sm:px-4 md:mb-8">
      <nav
        aria-label={t('home.navigation.ariaLabel')}
        className="pointer-events-auto w-full max-w-[46rem] pb-2"
      >
        <ul className="flex w-full flex-wrap items-start justify-center gap-x-2 gap-y-3 md:gap-x-4">
          {homeNavItems.map((item, index) => (
            <li className="flex basis-[calc(33.333%-0.4rem)] justify-center sm:basis-auto" key={item.labelKey}>
              <a
                className={cn(
                  'nav-note min-h-[3.2rem] w-full max-w-[7.3rem] px-2.5 py-2 text-[0.98rem] leading-[0.92] sm:max-w-none sm:px-4 sm:text-[1.18rem] md:min-h-[4rem] md:px-5 md:text-[1.6rem]',
                  noteToneClasses[item.tone],
                  noteShapeClasses[item.shape],
                )}
                href={item.href}
                style={
                  {
                    ['--note-offset' as string]: `${item.yOffset}px`,
                    ['--note-rotate' as string]: `${item.rotate}deg`,
                    animationDelay: `${index * 100}ms`,
                  } as CSSProperties
                }
              >
                <span className="relative z-10 text-center whitespace-normal sm:whitespace-nowrap">
                  {t(item.labelKey)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
