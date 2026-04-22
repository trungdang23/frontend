import type { CSSProperties } from 'react';
import { polaroidMoments } from '@/features/home/content/home-content';
import type {
  FastenerPosition,
  PolaroidMoment,
} from '@/features/home/content/home-content';
import type { AccentTone } from '@/features/shell/content/public-chrome-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const tapeToneClasses: Record<AccentTone, string> = {
  coral: 'bg-[rgba(242,160,136,0.78)]',
  leaf: 'bg-[rgba(167,215,173,0.78)]',
  sky: 'bg-[rgba(153,205,232,0.78)]',
  sun: 'bg-[rgba(242,204,111,0.82)]',
};

const fastenerPositionClasses: Record<FastenerPosition, string> = {
  'left-center': 'left-[-0.95rem] top-1/4 -rotate-90',
  'right-center': 'right-[-0.95rem] top-1/4 rotate-90',
  'top-center': 'left-1/2 top-[-0.95rem] -translate-x-1/2',
  'top-left': 'left-[10%] top-[-0.8rem] -rotate-12',
  'top-right': 'right-[10%] top-[-0.8rem] rotate-12',
};

const polaroidHoverClasses = [
  'polaroid-card--hover-lift',
  'polaroid-card--hover-sway',
  'polaroid-card--hover-flick',
  'polaroid-card--hover-bloom',
] as const;

export function PolaroidCluster() {
  return (
    <>
      <div className="absolute inset-0 hidden lg:block">
        {polaroidMoments.map((moment, index) => {
          const angle = (index / polaroidMoments.length) * Math.PI * 2 - Math.PI / 2;
          const x = 49 + 34 * Math.cos(angle);
          const y = 50 + 40 * Math.sin(angle);

          return (
            <div
              className="absolute w-32 xl:w-[10.9rem]"
              key={moment.id}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <PolaroidCard hoverClassName={polaroidHoverClasses[index % polaroidHoverClasses.length]} moment={moment} />
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-5 lg:hidden">
        {polaroidMoments.map((moment, index) => (
          <div
            key={moment.id}
            style={
              {
                transform:
                  index % 2 === 0
                    ? 'translateY(0.45rem)'
                    : 'translateY(-0.25rem)',
              } as CSSProperties
            }
          >
            <PolaroidCard hoverClassName={polaroidHoverClasses[index % polaroidHoverClasses.length]} moment={moment} />
          </div>
        ))}
      </div>
    </>
  );
}

function PolaroidCard({
  hoverClassName,
  moment,
}: {
  hoverClassName: string;
  moment: PolaroidMoment;
}) {
  const { t } = useI18n();

  return (
    <div
      className="polaroid-float-frame w-full"
      style={
        {
          ['--float-rotate' as string]: `${moment.rotate}deg`,
        } as CSSProperties
      }
    >
      <article
        className={cn(
          'polaroid-card relative border border-slate-100 bg-white p-2 pb-8 ring-1 ring-black/5',
          hoverClassName,
        )}
      >
        <Fastener moment={moment} />

        <div className="aspect-[4/3] overflow-hidden bg-[#e8e7e1]">
          <img
            alt={t(moment.titleKey)}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            src={moment.image}
          />
        </div>

        <p className="mt-2 text-center font-hand text-lg font-bold leading-tight text-slate-800 md:text-xl">
          {t(moment.titleKey)}
        </p>

        {moment.noteKey ? (
          <div className="pointer-events-none absolute -right-12 top-0 w-24 opacity-80">
            <svg className="h-8 w-8 rotate-[-30deg]" viewBox="0 0 100 100">
              <path
                className="text-slate-500"
                d="M10,50 Q40,40 10,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="ml-2 mt-[-0.5rem] block whitespace-nowrap font-hand text-xs italic leading-none text-slate-700 md:text-sm">
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
          'absolute z-20 inline-flex h-4 w-4 items-center justify-center rounded-full border border-red-800 bg-red-600 shadow-md',
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
        'absolute z-10 border border-white/20 backdrop-blur-[1px]',
        moment.fastenerType === 'washi'
          ? 'washi-strip h-7 w-20 opacity-80'
          : 'h-6 w-16 rounded-[0.35rem]',
        fastenerPositionClasses[moment.fastenerPosition],
        tapeToneClasses[moment.tone],
      )}
    />
  );
}
