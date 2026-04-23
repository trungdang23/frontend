import type { CSSProperties } from 'react';
import {
  Compass,
  MapPinned,
  Plane,
} from 'lucide-react';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

type PlannerPolaroidProps = {
  alt: string;
  dayLabel: string;
  imageUrl: string;
  label: string;
  tapeClassName: string;
  tiltClassName: string;
};

function PlannerPolaroid({
  alt,
  dayLabel,
  imageUrl,
  label,
  tapeClassName,
  tiltClassName,
}: PlannerPolaroidProps) {
  return (
    <div className="flex h-full flex-col items-center">
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-white px-3 pb-5 pt-3 shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]',
          tiltClassName,
        )}
      >
        <img
          alt={alt}
          className="h-28 w-full object-cover sm:h-32 md:h-36 lg:h-40"
          src={imageUrl}
        />
        <p className="mt-2 text-center font-marker text-[1.2rem] text-gray-800 sm:text-[1.45rem]">
          {label}
        </p>
        <div className={cn('absolute left-1/2 top-[-0.85rem] h-6 -translate-x-1/2 backdrop-blur-[1px]', tapeClassName)} />
      </div>
      <p className="mt-2 font-marker text-[1.15rem] font-bold text-gray-700 sm:text-[1.35rem]">
        {dayLabel}
      </p>
    </div>
  );
}

export function PlannerPage() {
  const { t } = useI18n();

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.planner}
      mainId="planner-content"
    >
      <div className="flex h-full min-h-0 w-full items-start justify-center py-0 lg:items-center">
        <section className="relative w-full overflow-hidden rounded-[0.35rem] bg-[#fffdf9] shadow-[0_24px_50px_rgba(0,0,0,0.11),0_12px_22px_rgba(0,0,0,0.08)]">
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-40 hidden w-20 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_20%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.03)_80%,rgba(0,0,0,0)_100%)] md:block" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-[41] hidden w-px -translate-x-1/2 bg-black/10 md:block" />

          <div className="flex flex-col md:flex-row">
            <div
              className="relative overflow-hidden border-b border-gray-100 bg-[#fffdfa] p-4 sm:p-5 md:min-h-[31rem] md:w-1/2 md:border-b-0 md:border-r md:p-6 lg:p-7"
              style={pageDotStyle}
            >
              <div className="relative z-30 max-w-[20rem]">
                <h1 className="font-marker text-[1.9rem] leading-[0.9] tracking-tight text-gray-800 uppercase sm:text-[2.45rem] lg:text-[2.8rem]">
                  <span className="block">{t('trips.planner.board.titleLine1')}</span>
                </h1>
                <p className="mt-2 font-cursive text-[1.55rem] leading-none text-gray-800 sm:text-[2rem]">
                  {t('trips.planner.board.subtitle')}
                </p>
              </div>

              <svg
                className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full opacity-70 sm:block"
                style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
                viewBox="0 0 100 100"
              >
                <defs>
                  <marker id="planner-arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
                    <polygon fill="#444" points="0 0, 10 3.5, 0 7" />
                  </marker>
                </defs>
                <path
                  className="[stroke-dasharray:6_4]"
                  d="M28,34 Q42,20 67,21"
                  fill="none"
                  markerEnd="url(#planner-arrowhead)"
                  stroke="#444"
                  strokeWidth="0.5"
                />
                <path
                  className="[stroke-dasharray:6_4]"
                  d="M73,39 Q77,58 54,70"
                  fill="none"
                  markerEnd="url(#planner-arrowhead)"
                  stroke="#444"
                  strokeWidth="0.5"
                />
                <path
                  className="[stroke-dasharray:6_4]"
                  d="M33,76 Q33,88 56,92"
                  fill="none"
                  markerEnd="url(#planner-arrowhead)"
                  stroke="#444"
                  strokeWidth="0.5"
                />
              </svg>

              <div className="relative z-20 mt-4 grid min-h-[20rem] grid-cols-1 gap-4 sm:min-h-[22rem] sm:grid-cols-2 sm:gap-5 md:mt-6 md:min-h-[25rem]">
                <PlannerPolaroid
                  alt={t('trips.planner.board.cards.hanoi')}
                  dayLabel={t('trips.planner.board.cards.hanoiDays')}
                  imageUrl="https://images.unsplash.com/photo-1555944805-d835180442e7?auto=format&fit=crop&w=400"
                  label={t('trips.planner.board.cards.hanoi')}
                  tapeClassName="w-12 rotate-1 bg-orange-400/40"
                  tiltClassName="-rotate-3"
                />

                <PlannerPolaroid
                  alt={t('trips.planner.board.cards.haLong')}
                  dayLabel={t('trips.planner.board.cards.haLongDays')}
                  imageUrl="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400"
                  label={t('trips.planner.board.cards.haLong')}
                  tapeClassName="w-14 -rotate-2 bg-blue-400/40"
                  tiltClassName="rotate-2 sm:translate-y-2"
                />

                <PlannerPolaroid
                  alt={t('trips.planner.board.cards.hoiAn')}
                  dayLabel={t('trips.planner.board.cards.hoiAnDays')}
                  imageUrl="https://images.unsplash.com/photo-1599708153386-62e2d366336e?auto=format&fit=crop&w=400"
                  label={t('trips.planner.board.cards.hoiAn')}
                  tapeClassName="w-14 rotate-3 bg-yellow-400/50"
                  tiltClassName="rotate-1 sm:-translate-y-1"
                />

                <PlannerPolaroid
                  alt={t('trips.planner.board.cards.daNang')}
                  dayLabel={t('trips.planner.board.cards.daNangDays')}
                  imageUrl="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&w=400"
                  label={t('trips.planner.board.cards.daNang')}
                  tapeClassName="w-12 -rotate-1 bg-pink-400/40"
                  tiltClassName="-rotate-1 sm:translate-y-1"
                />
              </div>

              <div className="pointer-events-none absolute bottom-8 left-6 hidden -rotate-[20deg] opacity-20 sm:block">
                <svg className="h-20 w-20 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>

            <div
              className="relative overflow-hidden bg-[#fffdfa] p-4 sm:p-5 md:min-h-[31rem] md:w-1/2 md:p-6 lg:p-7"
              style={pageDotStyle}
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10 opacity-[0.08]">
                <svg className="h-full w-full text-gray-900" fill="none" viewBox="0 0 200 320">
                  <path
                    d="M91 16 C110 30 121 52 114 70 C105 92 96 109 99 131 C103 154 121 172 118 192 C114 214 100 231 92 250 C84 269 73 287 62 304"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" fill="none" viewBox="0 0 100 100">
                <path
                  d="M64 15 C83 10 96 30 88 46"
                  stroke="#444"
                  strokeDasharray="5 5"
                  strokeWidth="0.5"
                />
                <path
                  d="M74 50 C83 64 86 80 74 92"
                  stroke="#444"
                  strokeDasharray="5 5"
                  strokeWidth="0.5"
                />
              </svg>

              <div className="absolute right-[10%] top-[10%] z-20 text-[#5b4b43]">
                <Plane className="h-6 w-6 rotate-[12deg]" strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-[20%] right-[10%] z-20 text-[#5b4b43]">
                <Plane className="h-6 w-6 -rotate-[24deg]" strokeWidth={1.5} />
              </div>

              <div className="absolute left-[28%] top-[19%] z-20 text-[#2563eb]">
                <MapPinned className="h-8 w-8 drop-shadow-sm" fill="currentColor" strokeWidth={1.6} />
              </div>
              <div className="absolute left-[46%] top-[50%] z-20 text-[#dc2626]">
                <MapPinned className="h-8 w-8 drop-shadow-sm" fill="currentColor" strokeWidth={1.6} />
              </div>
              <div className="absolute left-[54%] top-[71%] z-20 text-[#2563eb]">
                <MapPinned className="h-8 w-8 drop-shadow-sm" fill="currentColor" strokeWidth={1.6} />
              </div>

              <div className="absolute left-5 top-10 z-30 w-[11.8rem] rotate-[-1deg] border-l-[0.5rem] border-yellow-400 bg-[#fff9c4] p-4 shadow-xl sm:left-6 sm:top-12 sm:w-56">
                <div className="absolute left-1/2 top-[-1rem] h-8 w-20 -translate-x-1/2 rotate-3 bg-cyan-400/30 backdrop-blur-sm" />
                <p className="border-b-2 border-yellow-500/20 pb-2 font-marker text-[1.65rem] tracking-tight text-yellow-900 sm:text-[2rem]">
                  {t('trips.planner.board.checklistTitle')}
                </p>
                <ul className="mt-3 space-y-2.5 font-marker text-[1.2rem] text-gray-800 sm:text-[1.4rem]">
                  <li className="flex items-center gap-3">
                    <span className="text-2xl text-green-600">✔</span>
                    <span>{t('trips.planner.board.checklist.flight')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl text-green-600">✔</span>
                    <span>{t('trips.planner.board.checklist.camera')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-5 w-5 rounded-sm border-2 border-gray-400" />
                    <span>{t('trips.planner.board.checklist.train')}</span>
                  </li>
                </ul>
              </div>

              <div className="absolute bottom-10 right-10 z-20 opacity-30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-800/35">
                  <Compass className="h-8 w-8 text-gray-800" strokeWidth={1.4} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
