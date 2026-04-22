import type { CSSProperties } from 'react';
import { Languages } from 'lucide-react';
import { homeNavItems } from '@/features/home/content/home-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const noteToneClasses = {
  coral: 'bg-[#f3a186] text-[#5b2d21]',
  leaf: 'bg-[#a8d9ae] text-[#294030]',
  paper: 'bg-[#fffaf0] text-[#5b4335]',
  sky: 'bg-[#98caea] text-[#22455f]',
  sun: 'bg-[#f3cc68] text-[#624114]',
} as const;

const noteShapeClasses = {
  'fold-left': 'nav-note--fold-left',
  'fold-right': 'nav-note--fold-right',
  notebook: 'nav-note--notebook',
  straight: 'nav-note--straight',
  'torn-bottom': 'nav-note--torn-bottom',
} as const;

export function ScrapbookNav() {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex max-w-7xl flex-col gap-4 rounded-[2rem] px-3 py-3 md:px-4 md:py-4 xl:flex-row xl:items-start xl:justify-between">
        <nav
          aria-label={t('home.navigation.ariaLabel')}
          className="overflow-x-auto pb-1"
        >
          <ul className="flex w-max items-start gap-3">
            {homeNavItems.map((item, index) => (
              <li key={item.anchorId}>
                <a
                  className={cn(
                    'nav-note',
                    noteToneClasses[item.tone],
                    noteShapeClasses[item.shape],
                  )}
                  href={`#${item.anchorId}`}
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

        <div className="flex items-center justify-end gap-2 px-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] shadow-sm">
            <Languages className="h-4 w-4" />
            {t('common.language.label')}
          </span>
          {(['vi', 'en'] as const).map((nextLanguage) => {
            const active = language === nextLanguage;

            return (
              <button
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'border-[rgba(122,75,57,0.2)] bg-[rgba(255,249,239,0.92)] text-[var(--color-ink)] shadow-sm'
                    : 'border-white/70 bg-white/40 text-[var(--color-ink-soft)] hover:bg-white/60',
                )}
                key={nextLanguage}
                onClick={() => setLanguage(nextLanguage)}
                type="button"
              >
                {t(`common.language.${nextLanguage}`)}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
