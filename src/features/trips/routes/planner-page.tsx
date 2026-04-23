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
          'relative flex h-full w-full flex-col bg-white px-2.5 pb-4 pt-2.5 shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]',
          tiltClassName,
        )}
      >
        <img
          alt={alt}
          className="h-24 w-full object-cover sm:h-[6.5rem] md:h-28 lg:h-32"
          src={imageUrl}
        />
        <p className="mt-1.5 text-center font-marker text-[1.1rem] text-gray-800 sm:text-[1.3rem]">
          {label}
        </p>
        <div className={cn('absolute left-1/2 top-[-0.85rem] h-6 -translate-x-1/2 backdrop-blur-[1px]', tapeClassName)} />
      </div>
      <p className="mt-1.5 font-marker text-[1.05rem] font-bold text-gray-700 sm:text-[1.2rem]">
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
      <div className="flex h-full min-h-0 w-full items-start justify-center py-1 sm:py-2 lg:py-3">
        <section className="relative w-full overflow-hidden rounded-[0.35rem] bg-[#fffdf9] shadow-[0_24px_50px_rgba(0,0,0,0.11),0_12px_22px_rgba(0,0,0,0.08)]">
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-40 hidden w-20 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_20%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.03)_80%,rgba(0,0,0,0)_100%)] md:block" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-[41] hidden w-px -translate-x-1/2 bg-black/10 md:block" />

          <div className="flex flex-col md:flex-row">
            <div
              className="relative overflow-hidden border-b border-gray-100 bg-[#fffdfa] p-3.5 sm:p-4 md:min-h-[26.5rem] md:w-1/2 md:border-b-0 md:border-r md:p-[1.125rem] lg:p-5"
              style={pageDotStyle}
            >
              <div className="relative z-30">
                <div className="flex justify-center">
                  <h1 className="whitespace-nowrap font-title text-[1.85rem] leading-[0.92] tracking-[0.04em] text-gray-800 uppercase sm:text-[2.35rem] lg:text-[2.7rem]">
                    <span className="block">{t('trips.planner.board.titleLine1')}</span>
                  </h1>
                </div>
                <div className="mt-1.5 ml-[12%] w-fit sm:ml-[10%] md:ml-[8%] lg:ml-[6%]">
                  <p className="text-left font-cursive text-[1.4rem] leading-none text-gray-800 sm:text-[1.75rem]">
                    {t('trips.planner.board.subtitle')}
                  </p>
                </div>
              </div>

              <div className="relative mt-3 min-h-[17rem] sm:mt-4 sm:min-h-[20.5rem] md:min-h-[22rem]">
                <svg
                  className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full opacity-90 sm:block"
                  style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <marker
                      id="planner-arrowhead"
                      markerHeight="5"
                      markerWidth="5"
                      markerUnits="strokeWidth"
                      orient="auto"
                      refX="4.5"
                      refY="2.5"
                      viewBox="0 0 5 5"
                    >
                      <polygon fill="#444" points="0 0, 5 2.5, 0 5" />
                    </marker>
                  </defs>
                  <path
                    className="[stroke-dasharray:6_4]"
                    d="M18,0.5 C15,3.5 15,6.5 17,8.5 C19,10 21,11.5 23,12.5"
                    fill="none"
                    markerEnd="url(#planner-arrowhead)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#444"
                    strokeWidth="0.58"
                  />
                  <path
                    className="[stroke-dasharray:6_4]"
                    d="M31,6.5 C41,4 57,4 69,6.5"
                    fill="none"
                    markerEnd="url(#planner-arrowhead)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#444"
                    strokeWidth="0.58"
                  />
                  <path
                    className="[stroke-dasharray:6_4]"
                    d="M59,40 C57,45 53,49 47,52 C40,55 33,56 29,60"
                    fill="none"
                    markerEnd="url(#planner-arrowhead)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#444"
                    strokeWidth="0.58"
                  />
                  <path
                    className="[stroke-dasharray:6_4]"
                    d="M41,61 C48,58 57,57 66,57 C73,58 79,59 83,61"
                    fill="none"
                    markerEnd="url(#planner-arrowhead)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="#444"
                    strokeWidth="0.58"
                  />
                </svg>

                <div className="relative z-10 px-1 pt-6 sm:px-2.5 sm:pt-8 sm:pb-4 md:px-3 md:pt-9">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-11 sm:gap-y-[3.25rem] md:gap-x-12 md:gap-y-14">
                    <PlannerPolaroid
                      alt={t('trips.planner.board.cards.hanoi')}
                      dayLabel={t('trips.planner.board.cards.hanoiDays')}
                      imageUrl="/images/defaults/planner-hanoi.svg"
                      label={t('trips.planner.board.cards.hanoi')}
                      tapeClassName="w-12 rotate-1 bg-orange-400/40"
                      tiltClassName="-rotate-3"
                    />

                    <PlannerPolaroid
                      alt={t('trips.planner.board.cards.haLong')}
                      dayLabel={t('trips.planner.board.cards.haLongDays')}
                      imageUrl="/images/defaults/planner-halong.svg"
                      label={t('trips.planner.board.cards.haLong')}
                      tapeClassName="w-14 -rotate-2 bg-blue-400/40"
                      tiltClassName="rotate-2 sm:translate-y-2"
                    />

                    <PlannerPolaroid
                      alt={t('trips.planner.board.cards.hoiAn')}
                      dayLabel={t('trips.planner.board.cards.hoiAnDays')}
                      imageUrl="/images/defaults/planner-hoian.svg"
                      label={t('trips.planner.board.cards.hoiAn')}
                      tapeClassName="w-14 rotate-3 bg-yellow-400/50"
                      tiltClassName="rotate-1 sm:-translate-y-1"
                    />

                    <PlannerPolaroid
                      alt={t('trips.planner.board.cards.daNang')}
                      dayLabel={t('trips.planner.board.cards.daNangDays')}
                      imageUrl="/images/defaults/planner-danang.svg"
                      label={t('trips.planner.board.cards.daNang')}
                      tapeClassName="w-12 -rotate-1 bg-pink-400/40"
                      tiltClassName="-rotate-1 sm:translate-y-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-8 left-6 hidden -rotate-[20deg] opacity-20 sm:block">
                <svg className="h-20 w-20 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>

            <div
              className="relative overflow-hidden bg-[#fffdfa] p-3.5 sm:p-4 md:min-h-[26.5rem] md:w-1/2 md:p-[1.125rem] lg:p-5"
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
