import type { CSSProperties } from 'react';
import { polaroidMoments } from '@/features/home/content/home-content';
import type {
  AccentTone,
  FastenerPosition,
  PolaroidMoment,
} from '@/features/home/content/home-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const tapeToneClasses: Record<AccentTone, string> = {
  coral: 'bg-[rgba(242,160,136,0.82)]',
  leaf: 'bg-[rgba(167,215,173,0.82)]',
  sky: 'bg-[rgba(153,205,232,0.82)]',
  sun: 'bg-[rgba(242,204,111,0.84)]',
};

const fastenerPositionClasses: Record<FastenerPosition, string> = {
  'left-center': 'left-[-0.95rem] top-1/3 -rotate-90',
  'right-center': 'right-[-0.95rem] top-1/3 rotate-90',
  'top-center': 'left-1/2 top-[-0.95rem] -translate-x-1/2',
  'top-left': 'left-[10%] top-[-0.8rem] -rotate-12',
  'top-right': 'right-[10%] top-[-0.8rem] rotate-12',
};

export function PolaroidCluster() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {polaroidMoments.map((moment, index) => (
          <PolaroidCard
            animationDelayMs={index * 90}
            containerStyle={
              {
                left: `${moment.desktopX}%`,
                top: `${moment.desktopY}%`,
                transform: 'translate(-50%, -50%)',
              } as CSSProperties
            }
            key={moment.id}
            moment={moment}
            wrapperClassName="absolute w-36 xl:w-40"
          />
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:hidden">
        {polaroidMoments.slice(0, 4).map((moment, index) => (
          <PolaroidCard
            animationDelayMs={index * 90}
            containerStyle={
              {
                transform:
                  index % 2 === 0
                    ? `translateY(0.45rem) rotate(${moment.rotate}deg)`
                    : `translateY(-0.25rem) rotate(${moment.rotate}deg)`,
              } as CSSProperties
            }
            key={moment.id}
            moment={moment}
            wrapperClassName="w-full"
          />
        ))}
      </div>
    </>
  );
}

type PolaroidCardProps = {
  animationDelayMs?: number;
  containerStyle?: CSSProperties;
  moment: PolaroidMoment;
  wrapperClassName?: string;
};

function PolaroidCard({
  animationDelayMs,
  containerStyle,
  moment,
  wrapperClassName,
}: PolaroidCardProps) {
  const { t } = useI18n();

  return (
    <div className={cn(wrapperClassName)} style={containerStyle}>
      <article
        className="polaroid-card p-2 pb-7"
        style={
          {
            animationDelay: `${animationDelayMs ?? 0}ms`,
            ['--float-rotate' as string]: '0deg',
          } as CSSProperties
        }
      >
        <Fastener moment={moment} />

        <div className="aspect-[4/3] overflow-hidden rounded-[0.35rem] bg-[#ece7dd]">
          <img
            alt={t(moment.titleKey)}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            src={moment.image}
          />
        </div>

        <p className="mt-3 text-center font-hand text-[1.45rem] font-bold leading-none text-[var(--color-ink)]">
          {t(moment.titleKey)}
        </p>

        {moment.noteKey ? (
          <div className="absolute -right-10 top-2 w-20">
            <svg className="h-8 w-8 rotate-[-28deg] text-[rgba(122,75,57,0.74)]" viewBox="0 0 100 100">
              <path
                d="M10 54c20-10 26-16 36-34M46 20l4 14m-4-14 14 2"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <span className="mt-[-0.4rem] block font-hand text-lg font-semibold italic leading-none text-[var(--color-warm-brown)]">
              {t(moment.noteKey)}
            </span>
          </div>
        ) : null}
      </article>
    </div>
  );
}

function Fastener({ moment }: { moment: PolaroidMoment }) {
  if (moment.fastenerType === 'pin') {
    return (
      <span
        className={cn(
          'absolute z-20 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(126,46,36,0.7)] bg-[var(--color-warm-red)] shadow-md',
          fastenerPositionClasses[moment.fastenerPosition],
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'absolute z-10 border border-white/70 shadow-sm',
        moment.fastenerType === 'washi'
          ? 'washi-strip h-7 w-20'
          : 'h-6 w-16 rounded-[0.35rem]',
        fastenerPositionClasses[moment.fastenerPosition],
        tapeToneClasses[moment.tone],
      )}
    />
  );
}
