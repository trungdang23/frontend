import { MapPin } from 'lucide-react';
import { mapStops } from '@/features/home/content/home-content';
import type { AccentTone } from '@/features/home/content/home-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pinToneClasses: Record<AccentTone, string> = {
  coral: 'text-[#7a3d31]',
  leaf: 'text-[#2d5137]',
  sky: 'text-[#29556b]',
  sun: 'text-[#7a5617]',
};

const bubbleToneClasses: Record<AccentTone, string> = {
  coral: 'bg-[rgba(255,247,241,0.94)]',
  leaf: 'bg-[rgba(248,255,248,0.94)]',
  sky: 'bg-[rgba(246,252,255,0.94)]',
  sun: 'bg-[rgba(255,251,240,0.94)]',
};

export function VietnamMapBoard() {
  const { t } = useI18n();

  return (
    <section className="paper-panel overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
      <div className="absolute -left-12 top-10 h-24 w-24 rounded-full bg-[rgba(242,204,111,0.18)] blur-3xl" />
      <div className="absolute -right-10 bottom-10 h-28 w-28 rounded-full bg-[rgba(242,160,136,0.16)] blur-3xl" />

      <p className="section-label">{t('home.map.eyebrow')}</p>
      <h2 className="mt-4 max-w-md font-display text-[2.15rem] leading-tight text-[var(--color-ink)] sm:text-[2.45rem]">
        {t('home.map.title')}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-ink-soft)]">
        {t('home.map.description')}
      </p>

      <div
        className="relative mt-6 aspect-[0.88] overflow-hidden rounded-[2rem] border border-[rgba(122,75,57,0.12)] bg-[linear-gradient(180deg,rgba(250,239,209,0.95),rgba(242,224,183,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-6"
        id="map-board"
      >
        <div className="absolute inset-3 rotate-[-1.5deg] rounded-[1.75rem] border border-[rgba(122,75,57,0.1)] bg-[rgba(255,248,231,0.8)] shadow-[0_12px_24px_rgba(96,72,50,0.1)]" />
        <div className="absolute inset-4 rotate-[1.4deg] rounded-[1.7rem] border border-[rgba(122,75,57,0.08)] bg-[linear-gradient(180deg,rgba(255,252,243,0.78),rgba(245,229,197,0.86))]" />

        <svg
          className="relative z-10 mx-auto h-full w-full max-w-[20rem]"
          fill="none"
          viewBox="0 0 240 420"
        >
          <path
            d="M104 16c21 11 44 18 52 37 10 23-4 38-3 55 1 14 19 23 20 39 2 22-24 30-25 47-1 20 23 33 25 53 3 27-23 38-27 64-3 16 11 24 11 38 0 26-24 38-43 44-27 9-53-8-53-33 0-15 10-24 10-39 0-18-11-28-16-43-7-21 2-32 2-52 0-26-20-36-20-58 0-22 18-28 23-44 4-15-8-33-3-51 6-23 32-34 47-45z"
            fill="rgba(202, 175, 126, 0.24)"
            stroke="rgba(122, 75, 57, 0.42)"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d="M112 26c17 24 11 44 5 62-7 18 11 30 18 47 8 20-6 33-8 49-2 19 17 28 19 50 2 24-20 37-23 55-4 21 9 33 0 54-8 18-27 26-36 34"
            stroke="rgba(122, 75, 57, 0.46)"
            strokeDasharray="6 12"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M92 88c17 2 31 1 47-7M93 166c18 9 37 11 58 5M86 259c17 4 31 3 51-4M90 339c11 8 27 11 43 5"
            stroke="rgba(122, 75, 57, 0.28)"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>

        <div className="absolute inset-0 z-20">
          {mapStops.map((stop) => (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={stop.id}
              style={{ left: stop.x, top: stop.y }}
            >
              <div className={cn('relative', pinToneClasses[stop.tone])}>
                <MapPin className="h-6 w-6 fill-current drop-shadow-sm" />
                <div
                  className={cn(
                    'absolute left-full top-[-0.35rem] ml-2 hidden w-40 rounded-2xl border border-[rgba(122,75,57,0.1)] p-3 shadow-[0_14px_26px_rgba(96,72,50,0.12)] md:block',
                    bubbleToneClasses[stop.tone],
                  )}
                >
                  <p className="font-hand text-xl font-bold leading-none text-[var(--color-ink)]">
                    {t(stop.titleKey)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-ink-soft)]">
                    {t(stop.descriptionKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[rgba(122,75,57,0.08)] bg-white/60 px-4 py-4 shadow-[0_12px_22px_rgba(96,72,50,0.08)]">
          <p className="font-hand text-xl font-bold text-[var(--color-warm-brown)]">
            {t('home.map.moodLabel')}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
            {t('home.map.moodValue')}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[rgba(122,75,57,0.08)] bg-white/60 px-4 py-4 shadow-[0_12px_22px_rgba(96,72,50,0.08)]">
          <p className="font-hand text-xl font-bold text-[var(--color-warm-brown)]">
            {t('home.map.nextLabel')}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
            {t('home.map.nextValue')}
          </p>
        </article>
      </div>
    </section>
  );
}
