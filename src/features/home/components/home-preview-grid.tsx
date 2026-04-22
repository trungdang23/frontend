import {
  CircleUserRound,
  Compass,
  NotebookPen,
  Users,
} from 'lucide-react';
import { homePreviewCards } from '@/features/home/content/home-content';
import type { AccentTone, PreviewCard } from '@/features/home/content/home-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const iconMap = {
  community: Users,
  journal: NotebookPen,
  planner: Compass,
  profile: CircleUserRound,
} as const;

const badgeToneClasses: Record<AccentTone, string> = {
  coral: 'bg-[#f7d1c3] text-[#6f3d32]',
  leaf: 'bg-[#d7efdb] text-[#2d5137]',
  sky: 'bg-[#d9edf8] text-[#255367]',
  sun: 'bg-[#f8e5ab] text-[#6b4f1d]',
};

const tapeToneClasses: Record<AccentTone, string> = {
  coral: 'tape-tab--coral',
  leaf: 'tape-tab--leaf',
  sky: 'tape-tab--sky',
  sun: 'tape-tab--sun',
};

const tapePositionClasses: Record<PreviewCard['id'], string> = {
  community: 'left-8 rotate-[-5deg]',
  journal: 'left-10 rotate-[6deg]',
  planner: 'right-8 rotate-[4deg]',
  profile: 'right-10 rotate-[-6deg]',
};

export function HomePreviewGrid() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="home-previews-heading" className="space-y-6">
      <div className="max-w-3xl">
        <p className="section-label">{t('home.previews.eyebrow')}</p>
        <h2
          className="mt-4 font-display text-[2.3rem] leading-tight text-[var(--color-ink)] sm:text-[2.8rem]"
          id="home-previews-heading"
        >
          {t('home.previews.title')}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
          {t('home.previews.description')}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {homePreviewCards.map((card) => {
          const Icon = iconMap[card.icon];

          return (
            <article
              className="paper-panel overflow-hidden px-6 py-6 sm:px-7 sm:py-7"
              id={card.anchorId}
              key={card.id}
            >
              <div
                className={cn(
                  'tape-tab top-[-0.7rem]',
                  tapeToneClasses[card.tone],
                  tapePositionClasses[card.id],
                )}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">{t(card.eyebrowKey)}</p>
                  <h3 className="mt-4 font-display text-[2rem] leading-tight text-[var(--color-ink)]">
                    {t(card.titleKey)}
                  </h3>
                </div>

                <div
                  className={cn(
                    'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/70 shadow-sm',
                    badgeToneClasses[card.tone],
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                {t(card.descriptionKey)}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {card.detailKeys.map((detailKey) => (
                  <span
                    className={cn(
                      'rounded-full border border-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] shadow-sm',
                      badgeToneClasses[card.tone],
                    )}
                    key={detailKey}
                  >
                    {t(detailKey)}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
