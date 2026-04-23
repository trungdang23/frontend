import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Compass,
  MapPinned,
  Plane,
  Search,
} from 'lucide-react';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

const bookPerspectiveStyle: CSSProperties = {
  perspective: '2400px',
};

const bookSpreadStyle: CSSProperties = {
  transformOrigin: 'left center',
  transformStyle: 'preserve-3d',
};

const bookFaceStyle: CSSProperties = {
  WebkitBackfaceVisibility: 'hidden',
  backfaceVisibility: 'hidden',
};

const plannerFlipDurationMs = 2600;

type PlannerFlipPhase = 'intro' | 'forward' | 'created' | 'backward';

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

function PlannerLeftPage() {
  const { t } = useI18n();

  return (
    <div
      className="relative h-full min-h-0 overflow-hidden border-b border-gray-100 bg-[#fffdfa] p-3 sm:p-3.5 md:border-b-0 md:border-r md:p-3.5 lg:p-4"
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

      <div className="relative mt-3 min-h-[17rem] sm:mt-4 sm:min-h-[20rem] md:min-h-[19.25rem]">
        <svg
          className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full opacity-90 sm:block"
          style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
          viewBox="0 0 100 100"
        >
          <path
            className="[stroke-dasharray:6_4]"
            d="M18,0.5 C15,3.5 15,6.5 17,8.5 C19,10 21,11.5 23,12.5"
            fill="none"
            stroke="#444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.58"
          />
          <path
            className="[stroke-dasharray:6_4]"
            d="M31,6.5 C41,4 57,4 69,6.5"
            fill="none"
            stroke="#444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.58"
          />
          <path
            className="[stroke-dasharray:6_4]"
            d="M59,40 C57,45 53,49 47,52 C40,55 33,56 29,60"
            fill="none"
            stroke="#444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.58"
          />
          <path
            className="[stroke-dasharray:6_4]"
            d="M41,61 C48,58 57,57 66,57 C73,58 79,59 83,61"
            fill="none"
            stroke="#444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.58"
          />
          <polygon fill="#444" points="21.5,11.2 24,12.45 21.4,13.35" />
          <polygon fill="#444" points="66.4,5.55 69.4,6.55 66.3,7.55" />
          <polygon fill="#444" points="31.2,57.4 28.7,60.2 32.1,59.8" />
          <polygon fill="#444" points="80,59.8 83.3,61 79.9,62.15" />
        </svg>

        <div className="relative z-10 px-1 pt-6 sm:px-2.5 sm:pt-7 sm:pb-3 md:px-2.5 md:pt-7">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 md:gap-x-10 md:gap-y-10">
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
  );
}

function PlannerRightPageFront({
  onCreatePlan,
}: {
  onCreatePlan?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      className="relative h-full min-h-0 overflow-hidden bg-[#fffdfa] p-3 sm:p-3.5 md:p-3.5 lg:p-4"
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

      {onCreatePlan ? (
        <button
          className="absolute bottom-5 right-5 z-40 rounded-full border border-[#8b6244]/55 bg-[#f4cf8f] px-5 py-2.5 font-hand text-[1.5rem] leading-none text-[#4d2d1b] shadow-[0_12px_20px_rgba(90,62,40,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f8d9a2] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/30"
          onClick={onCreatePlan}
          type="button"
        >
          {t('trips.actions.create')}
        </button>
      ) : null}
    </div>
  );
}

function PlannerTapeTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn('relative mx-auto w-fit px-7 py-2 text-center', className)}>
      <span className="absolute inset-0 -skew-x-6 rounded-[0.2rem] bg-[#a8dfd5]/85 shadow-[0_4px_0_rgba(80,115,104,0.18)]" />
      <span className="absolute -left-3 top-0 h-full w-5 bg-[repeating-linear-gradient(135deg,#5b7da7_0_5px,#f4e9bf_5px_10px)] [clip-path:polygon(0_0,100%_0,78%_50%,100%_100%,0_100%)]" />
      <span className="absolute -right-3 top-0 h-full w-5 bg-[#a8dfd5]/85 [clip-path:polygon(0_0,100%_0,78%_50%,100%_100%,0_100%)]" />
      <span className="relative z-10 whitespace-nowrap font-cursive text-[1.6rem] font-bold leading-none text-[#1f2a24] sm:text-[2rem]">
        {children}
      </span>
    </div>
  );
}

function PlannerDateInput({
  iconSide,
  label,
}: {
  iconSide: 'left' | 'right';
  label: string;
}) {
  return (
    <label className="group relative block flex-1 min-w-[12rem]">
      <span className="sr-only">{label}</span>
      <span className="absolute -top-2 left-5 right-5 z-10 flex h-5 items-start justify-between">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            className="h-5 w-2 rounded-full border border-[#8a8075] bg-[#6f6b65] shadow-[0_2px_0_rgba(255,255,255,0.55)]"
            key={index}
          />
        ))}
      </span>
      <span className="relative flex min-h-[5.6rem] items-center rounded-[0.75rem] border border-[#8d8073] bg-[#fffdf6] px-4 py-3 shadow-[0_6px_0_#b9b2a5,0_12px_18px_rgba(59,44,32,0.14)] transition duration-300 group-focus-within:-translate-y-0.5 group-focus-within:border-[#6d5b4a]">
        {iconSide === 'left' ? (
          <CalendarDays className="mr-3 h-5 w-5 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        ) : null}
        <input
          aria-label={label}
          className="w-full min-w-0 border-b border-dashed border-[#9c9286] bg-transparent pb-1 text-center font-marker text-[1.05rem] text-[#3d332b] outline-none placeholder:text-[#6f685f] sm:text-[1.25rem]"
          placeholder={label}
          type="text"
        />
        {iconSide === 'right' ? (
          <CalendarDays className="ml-3 h-5 w-5 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        ) : null}
      </span>
    </label>
  );
}

function PlannerCreateTripPage({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden border-b border-gray-100 bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:min-h-0 md:border-r md:border-b-0 lg:px-8"
      style={pageDotStyle}
    >
      <button
        className="relative z-40 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-4 py-2 font-hand text-[1.25rem] leading-none text-[#6b4938] shadow-[0_10px_18px_rgba(90,62,40,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#fff8ea] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 sm:text-[1.45rem]"
        onClick={onBack}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        {t('trips.planner.board.returnToPreviousPageAction')}
      </button>

      <PlannerTapeTitle className="mt-4">
        {t('trips.planner.board.createSpread.stepTitle')}
      </PlannerTapeTitle>

      <div className="relative z-10 mt-14 space-y-8 sm:mt-16 lg:mt-20">
        <label className="block">
          <span className="block font-cursive text-[1.75rem] font-bold leading-none text-[#201916] sm:text-[2.2rem]">
            {t('trips.planner.board.createSpread.tripNameLabel')}
          </span>
          <input
            className="mt-4 w-full rounded-[0.7rem] border border-dashed border-[#b9aea0] bg-white/55 px-4 py-3 font-marker text-[1.15rem] text-[#3d332b] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none placeholder:text-[#6e655b] focus:border-[#7c6a58] focus:bg-white/75 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.35rem]"
            placeholder={t('trips.planner.board.createSpread.tripNamePlaceholder')}
            type="text"
          />
        </label>

        <div>
          <p className="font-cursive text-[1.75rem] font-bold leading-none text-[#201916] sm:text-[2.2rem]">
            {t('trips.planner.board.createSpread.dateLabel')}
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-8">
            <PlannerDateInput
              iconSide="right"
              label={t('trips.planner.board.createSpread.startDatePlaceholder')}
            />
            <span className="hidden font-marker text-[1.8rem] text-[#302720] sm:block">→</span>
            <PlannerDateInput
              iconSide="right"
              label={t('trips.planner.board.createSpread.endDatePlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-9">
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          {[
            'bg-[#a7d76f] ring-[#70a849]',
            'bg-[#99cde8] ring-[#6aa7c7]',
            'bg-[#f2cc6f] ring-[#c79a37]',
            'bg-[#f2a088] ring-[#c56d54]',
          ].map((className, index) => (
            <span
              className={cn(
                'grid h-12 w-12 place-items-center rounded-full font-marker text-[1.4rem] font-bold text-[#1e251d] shadow-[0_7px_14px_rgba(80,62,42,0.16)] ring-2 ring-offset-2 ring-offset-[#fffdfa]',
                index === 0 ? 'scale-110' : 'opacity-85',
                className,
              )}
              key={className}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlannerVietnamSketchMap() {
  const { t } = useI18n();

  return (
    <svg
      aria-label={t('trips.planner.board.createSpread.mapLabel')}
      className="h-full min-h-[20rem] w-full"
      role="img"
      viewBox="0 0 520 430"
    >
      <rect fill="#d7edf0" height="430" rx="26" width="520" />
      <path d="M0 0H520V430H0Z" fill="#d7edf0" />
      <path
        d="M6 70 C50 32 97 12 151 30 C193 44 217 34 249 18 C284 1 327 7 359 34 C397 67 434 57 514 35 L520 0 H0 Z"
        fill="#eef0c5"
      />
      <path
        d="M0 85 C35 80 58 98 81 128 C107 161 141 169 166 149 C199 122 232 118 258 146 C288 179 320 177 356 159 C401 136 440 156 520 191 V430 H0 Z"
        fill="#f2dfb8"
      />
      <path
        d="M121 47 C159 50 192 71 207 101 C220 126 208 154 232 181 C256 210 301 222 315 256 C329 291 307 317 333 344 C355 367 396 373 431 397 L386 430 H111 C123 395 119 360 91 330 C62 298 46 262 61 223 C78 177 63 137 32 101 C52 66 83 44 121 47Z"
        fill="#f2dfb8"
        stroke="#a88d70"
        strokeWidth="2"
      />
      <path
        d="M190 69 C213 78 230 92 236 112 C242 131 228 146 239 164 C254 188 292 192 305 218 C319 247 290 265 303 291 C316 318 352 321 371 346 C387 368 376 394 356 418 L330 427 C342 398 342 373 319 351 C294 326 265 313 264 284 C263 253 286 238 266 214 C248 191 211 184 206 154 C202 130 216 116 200 99 C190 89 174 84 156 81 C163 72 173 67 190 69Z"
        fill="#b6d78b"
        stroke="#637f55"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M196 82 C218 98 218 118 207 137 C195 158 208 175 231 184"
        fill="none"
        stroke="#6b8c5d"
        strokeDasharray="5 5"
        strokeWidth="2"
      />
      <path
        d="M275 238 C298 255 304 279 294 304 C287 323 301 337 323 348"
        fill="none"
        stroke="#6b8c5d"
        strokeDasharray="5 5"
        strokeWidth="2"
      />
      <path
        d="M438 49 C463 61 471 86 458 110 C443 137 450 168 486 190"
        fill="#d5e2ac"
        stroke="#789164"
        strokeWidth="2"
      />
      <path
        d="M350 155 C377 150 398 158 414 181 C432 207 456 209 490 198"
        fill="none"
        stroke="#86a9b1"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <g fill="#8e4d38" stroke="#693323" strokeWidth="2">
        <circle cx="179" cy="88" r="5" />
        <circle cx="213" cy="116" r="5" />
        <circle cx="305" cy="220" r="5" />
        <circle cx="319" cy="246" r="5" />
        <circle cx="314" cy="349" r="5" />
      </g>
      <g fill="#1f2a24" fontFamily="Patrick Hand, cursive" fontSize="18" fontWeight="700">
        <text x="190" y="80">Sapa</text>
        <text x="224" y="112">Hanoi</text>
        <text x="322" y="126">Ha Long Bay</text>
        <text x="321" y="219">Da Nang</text>
        <text x="334" y="249">Hoi An</text>
        <text x="330" y="353">Ho Chi Minh City</text>
      </g>
      <g transform="translate(67 239)">
        <circle cx="0" cy="0" fill="#f4ead6" r="28" stroke="#5f6f68" strokeWidth="2" />
        <path d="M0 -36L7 -7L36 0L7 7L0 36L-7 7L-36 0L-7 -7Z" fill="#86a9a0" stroke="#3d514a" strokeWidth="2" />
        <path d="M0 -26V26M-26 0H26" stroke="#3d514a" strokeWidth="2" />
        <text fill="#3d514a" fontFamily="Patrick Hand, cursive" fontSize="12" x="-4" y="-40">N</text>
        <text fill="#3d514a" fontFamily="Patrick Hand, cursive" fontSize="12" x="-4" y="49">S</text>
        <text fill="#3d514a" fontFamily="Patrick Hand, cursive" fontSize="12" x="-49" y="4">W</text>
        <text fill="#3d514a" fontFamily="Patrick Hand, cursive" fontSize="12" x="42" y="4">E</text>
      </g>
      <g transform="translate(353 152) rotate(-10)">
        <path d="M0 24H60L50 38H13Z" fill="#9a704f" stroke="#6b4938" strokeWidth="2" />
        <path d="M28 4V25" stroke="#6b4938" strokeWidth="2" />
        <path d="M30 8L52 25H31Z" fill="#f5f0e2" stroke="#6b4938" strokeWidth="2" />
      </g>
      <g transform="translate(438 292) rotate(-8)">
        <path d="M0 20H58L46 34H12Z" fill="#9a704f" stroke="#6b4938" strokeWidth="2" />
        <path d="M30 2V22" stroke="#6b4938" strokeWidth="2" />
        <path d="M32 7L51 22H33Z" fill="#f5f0e2" stroke="#6b4938" strokeWidth="2" />
      </g>
      <path
        d="M72 376 C89 364 106 365 122 376 M392 376 C410 361 431 361 449 376"
        fill="none"
        stroke="#6b8c95"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PlannerDestinationPage() {
  const { t } = useI18n();

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:min-h-0 lg:px-8"
      style={pageDotStyle}
    >
      <PlannerTapeTitle className="mt-1">
        {t('trips.planner.board.createSpread.destinationTitle')}
      </PlannerTapeTitle>

      <div className="relative z-20 mx-auto mt-6 w-full max-w-[23rem]">
        <label className="relative block rounded-[0.9rem] border-[3px] border-[#693a22] bg-[#b86f3f] p-2 shadow-[0_8px_0_rgba(80,47,31,0.25),0_16px_24px_rgba(80,47,31,0.16)]">
          <span className="sr-only">{t('trips.planner.board.createSpread.destinationSearchLabel')}</span>
          <input
            className="h-11 w-full rounded-[0.55rem] border border-[#7a4b39]/35 bg-[#fffaf3] pl-4 pr-11 font-marker text-[1.05rem] text-[#2f241e] outline-none placeholder:text-[#766c62] focus:ring-2 focus:ring-[#f4cf8f] sm:text-[1.18rem]"
            placeholder={t('trips.planner.board.createSpread.destinationSearchPlaceholder')}
            type="search"
          />
          <Search className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2f241e]" strokeWidth={2.2} />
        </label>
        <span className="absolute -left-9 top-5 hidden h-5 w-11 rounded-full border-2 border-[#6d5b4a] border-r-0 md:block" />
      </div>

      <div className="relative z-10 mt-4 flex-1 min-h-[21rem]">
        <div className="absolute inset-x-0 top-0 bottom-11 overflow-hidden rounded-[1.4rem] bg-[#d7edf0] shadow-[inset_0_0_0_1px_rgba(95,111,104,0.16)]">
          <PlannerVietnamSketchMap />
        </div>

        <div className="absolute bottom-12 left-2 w-[9.5rem] -rotate-1 border border-[#c7b58f] bg-[#fff8e6] p-3 shadow-[6px_8px_0_rgba(93,70,45,0.16),0_16px_20px_rgba(93,70,45,0.12)] sm:left-4 sm:w-44 sm:p-4">
          <span className="absolute -left-2 -top-4 h-12 w-4 rotate-[-8deg] rounded-full border-2 border-[#6d6a63] border-b-0" />
          <p className="font-cursive text-[1.4rem] font-bold leading-none text-[#201916] sm:text-[1.75rem]">
            {t('trips.planner.board.createSpread.notesTitle')}
          </p>
          <p className="mt-2 border-t border-dashed border-[#c7b58f] pt-2 font-marker text-[1rem] leading-tight text-[#2e241d] sm:text-[1.2rem]">
            {t('trips.planner.board.createSpread.notesBody')}
          </p>
        </div>

        <button
          className="absolute bottom-0 right-0 inline-flex items-center gap-2 rounded-[1.25rem] border-2 border-[#3a5d25] bg-[#b9e177] px-5 py-2.5 font-cursive text-[1.75rem] font-bold leading-none text-[#172612] shadow-[0_7px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 sm:px-6 sm:text-[2.1rem]"
          type="button"
        >
          {t('trips.planner.board.createSpread.continueAction')}
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function PlannerCreateSpread({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="md:h-full md:w-1/2">
        <PlannerCreateTripPage onBack={onBack} />
      </div>
      <div className="md:h-full md:w-1/2">
        <PlannerDestinationPage />
      </div>
    </div>
  );
}

export function PlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreatingPlan = searchParams.get('page') === 'next';
  const [flipPhase, setFlipPhase] = useState<PlannerFlipPhase>(() => (
    isCreatingPlan ? 'created' : 'intro'
  ));
  const previousIsCreatingPlan = useRef(isCreatingPlan);

  useEffect(() => {
    if (previousIsCreatingPlan.current === isCreatingPlan) {
      return;
    }

    previousIsCreatingPlan.current = isCreatingPlan;
    let timeoutId = 0;
    const frameId = window.requestAnimationFrame(() => {
      setFlipPhase(isCreatingPlan ? 'forward' : 'backward');

      timeoutId = window.setTimeout(() => {
        setFlipPhase(isCreatingPlan ? 'created' : 'intro');
      }, plannerFlipDurationMs);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [isCreatingPlan]);

  const hasCreatedSpreadVisible = flipPhase === 'created' || flipPhase === 'forward' || flipPhase === 'backward';
  const hasIntroLeftVisible = flipPhase === 'intro' || flipPhase === 'forward' || flipPhase === 'backward';

  const openNextPlannerPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', 'next');
    setSearchParams(nextParams, { replace: true });
  };

  const returnToIntroPlannerPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.planner}
      mainId="planner-content"
      scrollable={isCreatingPlan}
    >
      <div className="flex h-full min-h-0 w-full items-stretch justify-center">
        <div className="relative w-full px-2 py-1 sm:px-2.5 sm:py-1 md:flex md:h-full md:min-h-0 md:items-center md:px-2 md:py-1.5 lg:px-2.5 lg:py-2">
          <div className="pointer-events-none absolute inset-x-0 top-1 bottom-0 z-0 md:top-1.5 md:bottom-0">
            <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 rounded-[1rem] bg-[linear-gradient(180deg,#d1ab7b_0%,#b68558_100%)] shadow-[0_16px_30px_rgba(76,51,33,0.16)] sm:-left-2 sm:-right-2 md:-left-2.5 md:-right-2.5" />
            <div className="absolute left-1 right-1 top-0 bottom-[0.06rem] rounded-[1rem] border border-[#e6d8bd] bg-[#efe2ca] shadow-[0_12px_20px_rgba(76,51,33,0.11)] sm:left-1.5 sm:right-[1.25rem] sm:bottom-[0.12rem] md:left-[1.75rem] md:right-[1.25rem] md:bottom-[0.16rem]" />
            <div className="absolute left-2 right-0.5 top-0 bottom-[0.16rem] rounded-[1rem] border border-[#efe5d2] bg-[#f5ebd8] shadow-[0_10px_16px_rgba(76,51,33,0.09)] sm:left-2.5 sm:right-[0.75rem] sm:bottom-[0.26rem] md:left-[2.75rem] md:right-[0.9rem] md:bottom-[0.34rem]" />
            <div className="absolute left-3 right-0 top-0 bottom-[0.28rem] rounded-[1rem] border border-[#f6efe1] bg-[#fbf5ea] shadow-[0_8px_14px_rgba(76,51,33,0.07)] sm:left-3.5 sm:bottom-[0.42rem] md:left-[4.25rem] md:bottom-[0.5rem]" />
          </div>

          <section className="relative w-full overflow-hidden rounded-[1rem] border border-[#efe2ca] bg-[#fffdf9] shadow-[0_20px_36px_rgba(0,0,0,0.09),0_8px_16px_rgba(0,0,0,0.06)] md:h-[min(100%,calc(100dvh-10.9rem))] md:min-h-0 lg:h-[min(100%,calc(100dvh-11.25rem))]">
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-40 hidden w-20 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_20%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.03)_80%,rgba(0,0,0,0)_100%)] md:block" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-[41] hidden w-px -translate-x-1/2 bg-black/10 md:block" />

            <div className="flex flex-col md:hidden">
              {isCreatingPlan ? (
                <PlannerCreateSpread onBack={returnToIntroPlannerPage} />
              ) : (
                <>
                  <PlannerLeftPage />
                  <PlannerRightPageFront onCreatePlan={openNextPlannerPage} />
                </>
              )}
            </div>

            <div className="relative hidden h-full min-h-0 md:block">
              <div
                aria-hidden={!isCreatingPlan}
                className={cn(
                  'absolute inset-0',
                  hasCreatedSpreadVisible ? 'opacity-100' : 'opacity-0',
                  flipPhase === 'created' ? 'pointer-events-auto' : 'pointer-events-none',
                )}
                inert={flipPhase !== 'created'}
              >
                <PlannerCreateSpread onBack={returnToIntroPlannerPage} />
              </div>

              <div
                className={cn(
                  'absolute inset-y-0 left-0 z-10 w-1/2 transition-opacity duration-[900ms]',
                  hasIntroLeftVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
                  flipPhase === 'forward' ? 'delay-[1650ms]' : 'delay-0',
                )}
              >
                <PlannerLeftPage />
              </div>

              <div className="absolute inset-y-0 right-0 z-20 w-1/2 overflow-visible" style={bookPerspectiveStyle}>
                <div
                  className={cn(
                    'planner-page-turn-sheet relative h-full will-change-transform',
                    flipPhase === 'intro' ? 'planner-page-turn-sheet--intro' : null,
                    flipPhase === 'forward' ? 'planner-page-turn-sheet--forward' : null,
                    flipPhase === 'created' ? 'planner-page-turn-sheet--created' : null,
                    flipPhase === 'backward' ? 'planner-page-turn-sheet--backward' : null,
                  )}
                  style={bookSpreadStyle}
                >
                  <div
                    className={cn(
                      'planner-page-turn-spine pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-[linear-gradient(to_right,rgba(34,25,22,0.24),rgba(34,25,22,0.08),transparent)]',
                      flipPhase === 'intro' ? 'planner-page-turn-spine--intro' : null,
                      flipPhase === 'forward' ? 'planner-page-turn-spine--forward' : null,
                      flipPhase === 'created' ? 'planner-page-turn-spine--created' : null,
                      flipPhase === 'backward' ? 'planner-page-turn-spine--backward' : null,
                    )}
                  />
                  <div
                    className={cn(
                      'planner-page-turn-curl pointer-events-none absolute inset-y-[6%] right-0 z-20 w-10 rounded-l-full bg-[radial-gradient(circle_at_right,rgba(88,59,39,0.34)_0%,rgba(88,59,39,0.16)_42%,rgba(88,59,39,0)_78%)] blur-[1.5px]',
                      flipPhase === 'intro' ? 'planner-page-turn-curl--intro' : null,
                      flipPhase === 'forward' ? 'planner-page-turn-curl--forward' : null,
                      flipPhase === 'created' ? 'planner-page-turn-curl--created' : null,
                      flipPhase === 'backward' ? 'planner-page-turn-curl--backward' : null,
                    )}
                  />
                  <div className="absolute inset-0" style={bookFaceStyle}>
                    <PlannerRightPageFront onCreatePlan={openNextPlannerPage} />
                  </div>
                  <div className="absolute inset-0 [transform:rotateY(180deg)]" style={bookFaceStyle}>
                    <PlannerCreateTripPage onBack={returnToIntroPlannerPage} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
