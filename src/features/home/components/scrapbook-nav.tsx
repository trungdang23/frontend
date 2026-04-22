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
    <header className="pointer-events-none sticky top-0 z-[100] mb-8 flex w-full items-start justify-center px-4 pt-4 md:mb-12">
      <nav
        aria-label={t('home.navigation.ariaLabel')}
        className="pointer-events-auto overflow-x-auto pb-2"
      >
        <ul className="flex w-max items-start gap-2 md:gap-4">
          {homeNavItems.map((item, index) => (
            <li key={item.labelKey}>
              <a
                className={cn(
                  'nav-note h-12 px-4 text-xl md:h-16 md:px-6 md:text-3xl',
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
                <span className="relative z-10 whitespace-nowrap">
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
