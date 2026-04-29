import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Compass,
  MapPinned,
  Pencil,
  Plane,
  Trash2,
} from 'lucide-react';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { createTrip, deleteTrip } from '@/features/trips/api/trips-api';
import {
  createPlanNode,
  deletePlanNode,
  getTripPlanner,
  updatePlanNode,
} from '@/features/trips/planning/api/planner-api';
import {
  PlannerActivitySpread,
  type PlannerActivityCreateResult,
  type PlannerActivityDraft,
  type PlannerActivityDraftErrors,
  type PlannerActivityReservedTime,
} from '@/features/trips/planning/components/planner-activity-spread';
import {
  resolvePlannerActivityServerError,
  type PlannerActivityServerError,
} from '@/features/trips/planning/lib/activity-server-errors';
import { plannerQueryKeys } from '@/features/trips/planning/lib/planner-query-keys';
import type {
  PlanNode,
  PlanNodeMutationPayload,
  PlanNodeUpdatePayload,
  TripPlannerResult,
} from '@/features/trips/planning/types/plan-node';
import type { TripBudgetMode, TripUpsertPayload, TripVisibility } from '@/features/trips/types/trip';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

type PlannerTripDraft = {
  name: string;
  destination: string;
  summaryNotes: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  budgetMode: TripBudgetMode;
  manualBudgetAmount: string;
  manualBudgetCurrency: string;
  visibility: TripVisibility;
};

type PlannerTripDraftField = keyof PlannerTripDraft;
type PlannerTripDraftErrors = Partial<Record<PlannerTripDraftField, string>>;
type PlannerTripDraftChangeHandler = <Field extends PlannerTripDraftField>(
  field: Field,
  value: PlannerTripDraft[Field],
) => void;
type PlannerCalendarView = 'day' | 'month' | 'year';
type SavedPlannerActivityMode =
  | {
      kind: 'edit';
      nodeId: string;
    }
  | {
      kind: 'list';
    };
type SavedPlannerFeedback = {
  kind: 'error' | 'success';
  message: string;
};

const createDefaultPlannerTripDraft = (): PlannerTripDraft => ({
  name: '',
  destination: '',
  summaryNotes: '',
  coverImageUrl: '',
  startDate: '',
  endDate: '',
  budgetMode: 'auto',
  manualBudgetAmount: '',
  manualBudgetCurrency: 'VND',
  visibility: 'private',
});

function toNullableTrimmedValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function buildTripCreatePayload(draft: PlannerTripDraft): TripUpsertPayload {
  const isManualBudget = draft.budgetMode === 'manual';

  return {
    name: draft.name.trim(),
    destination: toNullableTrimmedValue(draft.destination),
    summaryNotes: toNullableTrimmedValue(draft.summaryNotes),
    coverImageUrl: toNullableTrimmedValue(draft.coverImageUrl),
    startDate: draft.startDate,
    endDate: draft.endDate,
    budgetMode: draft.budgetMode,
    manualBudgetAmount: isManualBudget ? Number(draft.manualBudgetAmount.trim()) : null,
    manualBudgetCurrency: isManualBudget ? draft.manualBudgetCurrency.trim().toUpperCase() : null,
    visibility: draft.visibility,
  };
}

function buildActivityDateTime(date: string, time: string) {
  return `${date}T${time || '00:00'}`;
}

function formatPlannerDateTime(value: string | null) {
  if (!value) {
    return '';
  }

  const [date, time = ''] = value.split('T');
  const formattedDate = formatPlannerDate(date);
  const formattedTime = time.slice(0, 5);

  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}

function formatPlanNodeSchedule(node: PlanNode) {
  if (!node.startAt && !node.endAt) {
    return '';
  }

  if (!node.startAt) {
    return formatPlannerDateTime(node.endAt);
  }

  if (!node.endAt) {
    return formatPlannerDateTime(node.startAt);
  }

  const startDate = node.startAt.slice(0, 10);
  const endDate = node.endAt.slice(0, 10);

  if (startDate === endDate) {
    return `${formatPlannerDate(startDate)} · ${node.startAt.slice(11, 16)} - ${node.endAt.slice(11, 16)}`;
  }

  return `${formatPlannerDateTime(node.startAt)} - ${formatPlannerDateTime(node.endAt)}`;
}

function formatPlanNodeCost(node: PlanNode) {
  if (node.costAmount === null || node.costCurrency === null) {
    return '';
  }

  return `${new Intl.NumberFormat('vi-VN').format(node.costAmount)} ${node.costCurrency}`;
}

function buildActivityPlanNodePayload(
  tripId: string,
  draft: PlannerActivityDraft,
  sortOrder: number,
): PlanNodeMutationPayload {
  const costAmount = draft.costAmount.trim() ? Number(draft.costAmount.trim()) : null;

  return {
    tripId,
    parentId: null,
    type: 'activity',
    title: draft.title.trim(),
    notes: toNullableTrimmedValue(draft.notes),
    startAt: buildActivityDateTime(draft.date, draft.startTime),
    endAt: draft.endTime ? buildActivityDateTime(draft.date, draft.endTime) : null,
    costAmount,
    costCurrency: costAmount === null ? null : draft.costCurrency.trim().toUpperCase(),
    imageUrl: toNullableTrimmedValue(draft.imageUrl),
    sortOrder,
  };
}

function buildActivityPlanNodeUpdatePayload(draft: PlannerActivityDraft): PlanNodeUpdatePayload {
  const costAmount = draft.costAmount.trim() ? Number(draft.costAmount.trim()) : null;

  return {
    type: 'activity',
    title: draft.title.trim(),
    notes: toNullableTrimmedValue(draft.notes),
    startAt: buildActivityDateTime(draft.date, draft.startTime),
    endAt: draft.endTime ? buildActivityDateTime(draft.date, draft.endTime) : null,
    costAmount,
    costCurrency: costAmount === null ? null : draft.costCurrency.trim().toUpperCase(),
    imageUrl: toNullableTrimmedValue(draft.imageUrl),
  };
}

function buildActivityDraftFromPlanNode(node: PlanNode): PlannerActivityDraft {
  const fallbackDate = node.endAt?.slice(0, 10) ?? '';
  const startDate = node.startAt?.slice(0, 10) ?? fallbackDate;

  return {
    title: node.title,
    date: startDate,
    startTime: node.startAt?.slice(11, 16) ?? '',
    endTime: node.endAt?.slice(11, 16) ?? '',
    location: '',
    costAmount: node.costAmount === null ? '' : String(node.costAmount),
    costCurrency: node.costCurrency ?? 'VND',
    notes: node.notes ?? '',
    imageUrl: node.imageUrl ?? '',
  };
}

function formatPlannerDate(value: string) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatPlannerMonthTitle(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    return monthKey;
  }

  return `Tháng ${month}/${year}`;
}

function getCurrentPlannerMonthKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${today.getFullYear()}-${month}`;
}

function getPlannerMonthKey(value: string) {
  return value ? value.slice(0, 7) : getCurrentPlannerMonthKey();
}

function shiftPlannerMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const nextMonth = new Date(year, month - 1 + offset, 1);
  const nextMonthNumber = String(nextMonth.getMonth() + 1).padStart(2, '0');

  return `${nextMonth.getFullYear()}-${nextMonthNumber}`;
}

function setPlannerMonth(monthKey: string, nextMonth: number) {
  const [year] = monthKey.split('-').map(Number);
  const month = String(nextMonth).padStart(2, '0');

  return `${year}-${month}`;
}

function setPlannerYear(monthKey: string, nextYear: number) {
  const [, month] = monthKey.split('-');

  return `${nextYear}-${month || '01'}`;
}

function getPlannerYearRange(monthKey: string) {
  const [year] = monthKey.split('-').map(Number);
  const startYear = year - 5;

  return Array.from({ length: 12 }, (_, index) => startYear + index);
}

function toPlannerIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildPlannerCalendarDays(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(year, month - 1, 1 - leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);

    date.setDate(firstVisibleDay.getDate() + index);

    return {
      date: toPlannerIsoDate(date),
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
    };
  });
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type PlannerPolaroidProps = {
  alt: string;
  dayLabel: string;
  imageUrl: string;
  label: string;
  tapeClassName: string;
  tiltClassName: string;
};

function PlannerPolaroid({ alt, dayLabel, imageUrl, label, tapeClassName, tiltClassName }: PlannerPolaroidProps) {
  return (
    <div className="flex h-full flex-col items-center">
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-white px-2.5 pb-4 pt-2.5 shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]',
          tiltClassName,
        )}
      >
        <img alt={alt} className="h-24 w-full object-cover sm:h-[6.5rem] md:h-28 lg:h-32" src={imageUrl} />
        <p className="mt-1.5 text-center font-marker text-[1.1rem] text-gray-800 sm:text-[1.3rem]">{label}</p>
        <div
          className={cn('absolute left-1/2 top-[-0.85rem] h-6 -translate-x-1/2 backdrop-blur-[1px]', tapeClassName)}
        />
      </div>
      <p className="mt-1.5 font-marker text-[1.05rem] font-bold text-gray-700 sm:text-[1.2rem]">{dayLabel}</p>
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

function PlannerRightPageFront({ onCreatePlan }: { onCreatePlan?: () => void }) {
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
        <path d="M64 15 C83 10 96 30 88 46" stroke="#444" strokeDasharray="5 5" strokeWidth="0.5" />
        <path d="M74 50 C83 64 86 80 74 92" stroke="#444" strokeDasharray="5 5" strokeWidth="0.5" />
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

function PlannerTapeTitle({ children, className }: { children: string; className?: string }) {
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

function PlannerFieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 font-marker text-[0.98rem] leading-tight text-[#b42318]" id={id} role="alert">
      {message}
    </p>
  );
}

function PlannerDateInput({
  error,
  iconSide,
  label,
  onChange,
  value,
}: {
  error?: string;
  iconSide: 'left' | 'right';
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<PlannerCalendarView>('day');
  const [visibleMonth, setVisibleMonth] = useState(() => getPlannerMonthKey(value));
  const [visibleYear, visibleMonthNumber] = visibleMonth.split('-').map(Number);
  const displayValue = formatPlannerDate(value);
  const errorId = error ? `${label.replace(/\W+/g, '-').toLowerCase()}-error` : undefined;
  const calendarDays = buildPlannerCalendarDays(visibleMonth);
  const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const monthLabels = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
  const yearRange = getPlannerYearRange(visibleMonth);

  useEffect(() => {
    if (!isPickerOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!datePickerRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  const openPicker = () => {
    setVisibleMonth(getPlannerMonthKey(value));
    setCalendarView('day');
    setIsPickerOpen(true);
  };

  const moveCalendarBackward = () => {
    if (calendarView === 'year') {
      setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, -144));
      return;
    }

    if (calendarView === 'month') {
      setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, -12));
      return;
    }

    setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, -1));
  };

  const moveCalendarForward = () => {
    if (calendarView === 'year') {
      setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, 144));
      return;
    }

    if (calendarView === 'month') {
      setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, 12));
      return;
    }

    setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, 1));
  };

  const openNextCalendarView = () => {
    if (calendarView === 'day') {
      setCalendarView('month');
      return;
    }

    if (calendarView === 'month') {
      setCalendarView('year');
    }
  };

  const calendarTitle =
    calendarView === 'year'
      ? `${yearRange[0]} - ${yearRange[yearRange.length - 1]}`
      : calendarView === 'month'
        ? `Năm ${visibleYear}`
        : formatPlannerMonthTitle(visibleMonth);

  return (
    <div className="group relative block flex-1 min-w-[10.75rem]" ref={datePickerRef}>
      <span className="absolute -top-2 left-5 right-5 z-10 flex h-5 items-start justify-between">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            className="h-5 w-2 rounded-full border border-[#8a8075] bg-[#6f6b65] shadow-[0_2px_0_rgba(255,255,255,0.55)]"
            key={index}
          />
        ))}
      </span>
      <button
        aria-describedby={errorId}
        aria-expanded={isPickerOpen}
        aria-label={label}
        className={cn(
          'relative flex min-h-[5.45rem] w-full cursor-pointer items-center rounded-[0.75rem] border bg-[#fffdf6] px-4 py-3 text-left shadow-[0_6px_0_#b9b2a5,0_12px_18px_rgba(59,44,32,0.14)] transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
          error ? 'border-[#d92d20]' : 'border-[#8d8073] hover:border-[#6d5b4a]',
        )}
        onClick={openPicker}
        type="button"
      >
        {iconSide === 'left' ? (
          <CalendarDays className="mr-3 h-5 w-5 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        ) : null}
        <span className="w-full min-w-0 border-b border-dashed border-[#9c9286] pb-1 text-center font-marker text-[1.05rem] text-[#3d332b] sm:text-[1.2rem]">
          {displayValue || <span className="text-[#6f685f]">{label}</span>}
        </span>
        {iconSide === 'right' ? (
          <CalendarDays className="ml-3 h-5 w-5 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        ) : null}
      </button>

      {isPickerOpen ? (
        <div className="absolute bottom-full left-1/2 z-[100] mb-4 w-[18rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-[0.9rem] border border-[#b8a58e] bg-[#fffaf0] p-3 shadow-[0_18px_32px_rgba(59,44,32,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <button
              aria-label="Lùi lịch"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#b8a58e] bg-white/70 font-marker text-[1.2rem] text-[#3d332b] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
              onClick={moveCalendarBackward}
              type="button"
            >
              ‹
            </button>
            <button
              className={cn(
                'min-w-0 rounded-full px-3 py-1.5 font-marker text-[1.05rem] font-bold text-[#3d332b] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                calendarView === 'year' ? 'cursor-default' : 'hover:bg-white/75',
              )}
              disabled={calendarView === 'year'}
              onClick={openNextCalendarView}
              type="button"
            >
              {calendarTitle}
            </button>
            <button
              aria-label="Tiến lịch"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#b8a58e] bg-white/70 font-marker text-[1.2rem] text-[#3d332b] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
              onClick={moveCalendarForward}
              type="button"
            >
              ›
            </button>
          </div>

          {calendarView === 'day' ? (
            <>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center font-marker text-[0.82rem] font-bold text-[#75685b]">
                {weekdayLabels.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((calendarDay) => {
                  const isSelectedDate = calendarDay.date === value;

                  return (
                    <button
                      className={cn(
                        'grid h-8 place-items-center rounded-[0.45rem] font-marker text-[0.95rem] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                        calendarDay.isCurrentMonth ? 'text-[#342820]' : 'text-[#b7a99a]',
                        isSelectedDate
                          ? 'bg-[#b9e177] font-bold text-[#172612] shadow-[0_4px_0_#6f9e44]'
                          : 'hover:bg-white/80',
                      )}
                      key={calendarDay.date}
                      onClick={() => {
                        onChange(calendarDay.date);
                        setIsPickerOpen(false);
                      }}
                      type="button"
                    >
                      {calendarDay.dayOfMonth}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {calendarView === 'month' ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {monthLabels.map((monthLabel, index) => {
                const monthNumber = index + 1;
                const isSelectedMonth = monthNumber === visibleMonthNumber;

                return (
                  <button
                    className={cn(
                      'rounded-[0.6rem] px-2 py-2.5 font-marker text-[1rem] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                      isSelectedMonth
                        ? 'bg-[#b9e177] font-bold text-[#172612] shadow-[0_4px_0_#6f9e44]'
                        : 'bg-white/50 text-[#3d332b] hover:bg-white/80',
                    )}
                    key={monthLabel}
                    onClick={() => {
                      setVisibleMonth((currentMonth) => setPlannerMonth(currentMonth, monthNumber));
                      setCalendarView('day');
                    }}
                    type="button"
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
          ) : null}

          {calendarView === 'year' ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {yearRange.map((year) => {
                const isSelectedYear = year === visibleYear;

                return (
                  <button
                    className={cn(
                      'rounded-[0.6rem] px-2 py-2.5 font-marker text-[1rem] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                      isSelectedYear
                        ? 'bg-[#b9e177] font-bold text-[#172612] shadow-[0_4px_0_#6f9e44]'
                        : 'bg-white/50 text-[#3d332b] hover:bg-white/80',
                    )}
                    key={year}
                    onClick={() => {
                      setVisibleMonth((currentMonth) => setPlannerYear(currentMonth, year));
                      setCalendarView('month');
                    }}
                    type="button"
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <PlannerFieldError id={errorId} message={error} />
    </div>
  );
}

function PlannerStepProgress({ currentStep }: { currentStep: number }) {
  const stepClassNames = [
    'bg-[#a7d76f] ring-[#70a849]',
    'bg-[#99cde8] ring-[#6aa7c7]',
    'bg-[#f2cc6f] ring-[#c79a37]',
    'bg-[#f2a088] ring-[#c56d54]',
  ];

  return (
    <div className="flex min-h-16 items-center justify-center gap-4 sm:gap-6">
      {stepClassNames.map((className, index) => {
        const stepNumber = index + 1;
        const isCurrentStep = stepNumber === currentStep;

        return (
          <span
            aria-current={isCurrentStep ? 'step' : undefined}
            className={cn(
              'grid place-items-center rounded-full font-marker font-bold text-[#1e251d] ring-2 ring-offset-2 ring-offset-[#fffdfa] transition-all duration-500',
              isCurrentStep
                ? 'h-14 w-14 -translate-y-1 animate-pulse text-[1.55rem] shadow-[0_13px_22px_rgba(67,92,38,0.25)] ring-4'
                : 'h-10 w-10 text-[1.2rem] opacity-70 shadow-[0_6px_12px_rgba(80,62,42,0.12)]',
              className,
            )}
            key={className}
          >
            {stepNumber}
          </span>
        );
      })}
    </div>
  );
}

function PlannerCreateTripPage({
  draft,
  errors,
  onDraftChange,
  onBack,
}: {
  draft: PlannerTripDraft;
  errors: PlannerTripDraftErrors;
  onDraftChange: PlannerTripDraftChangeHandler;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const tripNameErrorId = errors.name ? 'planner-trip-name-error' : undefined;
  const manualBudgetAmountErrorId = errors.manualBudgetAmount ? 'planner-manual-budget-amount-error' : undefined;
  const manualBudgetCurrencyErrorId = errors.manualBudgetCurrency ? 'planner-manual-budget-currency-error' : undefined;

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-visible border-b border-gray-100 bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:min-h-0 md:border-r md:border-b-0 lg:px-8"
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

      <PlannerTapeTitle className="mt-3">{t('trips.planner.board.createSpread.stepTitle')}</PlannerTapeTitle>

      <div className="relative mt-7 flex-1 space-y-5 sm:mt-9">
        <label className="block">
          <span className="block font-cursive text-[1.75rem] font-bold leading-none text-[#201916] sm:text-[2.2rem]">
            {t('trips.planner.board.createSpread.tripNameLabel')}
          </span>
          <input
            aria-describedby={tripNameErrorId}
            className={cn(
              'mt-3 w-full rounded-[0.7rem] border border-dashed bg-white/55 px-4 py-3 font-marker text-[1.1rem] text-[#3d332b] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none placeholder:text-[#6e655b] focus:bg-white/75 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.28rem]',
              errors.name ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
            )}
            onChange={(event) => onDraftChange('name', event.target.value)}
            placeholder={t('trips.planner.board.createSpread.tripNamePlaceholder')}
            type="text"
            value={draft.name}
          />
          <PlannerFieldError id={tripNameErrorId} message={errors.name} />
        </label>

        <div>
          <p className="font-cursive text-[1.75rem] font-bold leading-none text-[#201916] sm:text-[2.1rem]">
            {t('trips.planner.board.createSpread.dateLabel')}
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-5">
            <PlannerDateInput
              error={errors.startDate}
              iconSide="right"
              label={t('trips.planner.board.createSpread.startDatePlaceholder')}
              onChange={(value) => onDraftChange('startDate', value)}
              value={draft.startDate}
            />
            <span className="hidden pt-8 font-marker text-[1.8rem] text-[#302720] sm:block">→</span>
            <PlannerDateInput
              error={errors.endDate}
              iconSide="right"
              label={t('trips.planner.board.createSpread.endDatePlaceholder')}
              onChange={(value) => onDraftChange('endDate', value)}
              value={draft.endDate}
            />
          </div>
        </div>

        <div>
          <p className="font-cursive text-[1.65rem] font-bold leading-none text-[#201916] sm:text-[2rem]">
            {t('trips.fields.budgetMode')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-[0.85rem] border border-[#b9aea0] bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            {(['auto', 'manual'] as const).map((mode) => (
              <button
                aria-pressed={draft.budgetMode === mode}
                className={cn(
                  'rounded-[0.65rem] px-3 py-2 font-marker text-[1.05rem] leading-none transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 sm:text-[1.2rem]',
                  draft.budgetMode === mode
                    ? 'bg-[#f4cf8f] text-[#3f2819] shadow-[0_5px_0_rgba(139,98,68,0.2)]'
                    : 'text-[#65584b] hover:bg-[#fff7e8]',
                )}
                key={mode}
                onClick={() => onDraftChange('budgetMode', mode)}
                type="button"
              >
                {t(mode === 'auto' ? 'trips.budget.modeAuto' : 'trips.budget.modeManual')}
              </button>
            ))}
          </div>

          {draft.budgetMode === 'manual' ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <label className="block">
                <span className="sr-only">{t('trips.fields.manualBudgetAmount')}</span>
                <input
                  aria-describedby={manualBudgetAmountErrorId}
                  className={cn(
                    'w-full rounded-[0.65rem] border border-dashed bg-white/60 px-3 py-2.5 font-marker text-[1.05rem] text-[#3d332b] outline-none placeholder:text-[#6e655b] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.16rem]',
                    errors.manualBudgetAmount ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
                  )}
                  inputMode="numeric"
                  onChange={(event) => onDraftChange('manualBudgetAmount', event.target.value.replace(/\D/g, ''))}
                  placeholder={t('trips.fields.manualBudgetAmount')}
                  type="text"
                  value={draft.manualBudgetAmount}
                />
                <PlannerFieldError id={manualBudgetAmountErrorId} message={errors.manualBudgetAmount} />
              </label>
              <label className="block">
                <span className="sr-only">{t('trips.fields.manualBudgetCurrency')}</span>
                <input
                  aria-describedby={manualBudgetCurrencyErrorId}
                  className={cn(
                    'w-full rounded-[0.65rem] border border-dashed bg-white/60 px-3 py-2.5 text-center font-marker text-[1.05rem] uppercase text-[#3d332b] outline-none placeholder:text-[#6e655b] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.16rem]',
                    errors.manualBudgetCurrency ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
                  )}
                  maxLength={3}
                  onChange={(event) => onDraftChange('manualBudgetCurrency', event.target.value.toUpperCase())}
                  placeholder={t('trips.placeholders.manualBudgetCurrency')}
                  type="text"
                  value={draft.manualBudgetCurrency}
                />
                <PlannerFieldError id={manualBudgetCurrencyErrorId} message={errors.manualBudgetCurrency} />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <PlannerStepProgress currentStep={1} />
      </div>
    </div>
  );
}

function PlannerCoverPreview({ imageUrl }: { imageUrl: string }) {
  const { t } = useI18n();
  const coverImageUrl = imageUrl.trim();
  const shouldShowCoverImage = coverImageUrl && isValidHttpUrl(coverImageUrl);

  return (
    <div
      aria-hidden={!shouldShowCoverImage}
      className="relative h-24 overflow-hidden rounded-[1.1rem] border border-dashed border-[#b9aea0] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:h-28"
    >
      {shouldShowCoverImage ? (
        <>
          <img
            alt={t('trips.preview.coverAltFallback')}
            className="absolute inset-0 h-full w-full object-cover"
            src={coverImageUrl}
          />
          <span className="pointer-events-none absolute left-1/2 top-0 h-7 w-24 -translate-x-1/2 -translate-y-2 rotate-2 bg-[#f4cf8f]/55 shadow-[0_4px_8px_rgba(90,62,40,0.12)] backdrop-blur-[1px]" />
        </>
      ) : null}
    </div>
  );
}

function PlannerDestinationPage({
  draft,
  errors,
  onDraftChange,
  onContinue,
}: {
  draft: PlannerTripDraft;
  errors: PlannerTripDraftErrors;
  onDraftChange: PlannerTripDraftChangeHandler;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const coverImageUrlErrorId = errors.coverImageUrl ? 'planner-cover-image-url-error' : undefined;
  const summaryNotesErrorId = errors.summaryNotes ? 'planner-summary-notes-error' : undefined;

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden bg-[#fffdfa] px-5 pb-8 pt-5 sm:px-7 sm:pb-9 sm:pt-6 md:min-h-0 lg:px-8"
      style={pageDotStyle}
    >
      <PlannerTapeTitle className="mt-1">{t('trips.planner.board.createSpread.detailsTitle')}</PlannerTapeTitle>

      <div className="relative z-10 mt-6 flex flex-1 flex-col gap-3.5">
        <label className="block">
          <span className="block font-cursive text-[1.55rem] font-bold leading-none text-[#201916] sm:text-[1.9rem]">
            {t('trips.fields.coverImageUrl')}
          </span>
          <input
            aria-describedby={coverImageUrlErrorId}
            className={cn(
              'mt-2 w-full rounded-[0.7rem] border border-dashed bg-white/55 px-4 py-2.5 font-marker text-[1.02rem] text-[#3d332b] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none placeholder:text-[#6e655b] focus:bg-white/75 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.14rem]',
              errors.coverImageUrl ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
            )}
            onChange={(event) => onDraftChange('coverImageUrl', event.target.value)}
            placeholder={t('trips.placeholders.coverImageUrl')}
            type="url"
            value={draft.coverImageUrl}
          />
          <PlannerFieldError id={coverImageUrlErrorId} message={errors.coverImageUrl} />
        </label>

        <label className="block">
          <span className="block font-cursive text-[1.55rem] font-bold leading-none text-[#201916] sm:text-[1.9rem]">
            {t('trips.fields.summaryNotes')}
          </span>
          <textarea
            aria-describedby={summaryNotesErrorId}
            className={cn(
              'mt-2 min-h-24 w-full resize-none rounded-[0.7rem] border border-dashed bg-white/55 px-4 py-3 font-marker text-[1.02rem] leading-tight text-[#3d332b] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none placeholder:text-[#6e655b] focus:bg-white/75 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.14rem]',
              errors.summaryNotes ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
            )}
            onChange={(event) => onDraftChange('summaryNotes', event.target.value)}
            placeholder={t('trips.placeholders.summaryNotes')}
            value={draft.summaryNotes}
          />
          <PlannerFieldError id={summaryNotesErrorId} message={errors.summaryNotes} />
        </label>

        <div className="shrink-0">
          <p className="font-cursive text-[1.55rem] font-bold leading-none text-[#201916] sm:text-[1.9rem]">
            {t('trips.planner.board.createSpread.visibilityLabel')}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-[0.85rem] border border-[#b9aea0] bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            {(['private', 'public'] as const).map((visibility) => (
              <button
                aria-pressed={draft.visibility === visibility}
                className={cn(
                  'rounded-[0.65rem] px-3 py-2 font-marker text-[1.05rem] leading-none transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 sm:text-[1.16rem]',
                  draft.visibility === visibility
                    ? 'bg-[#a8dfd5] text-[#1f2a24] shadow-[0_5px_0_rgba(80,115,104,0.2)]'
                    : 'text-[#65584b] hover:bg-[#fff7e8]',
                )}
                key={visibility}
                onClick={() => onDraftChange('visibility', visibility)}
                type="button"
              >
                {t(`trips.visibility.${visibility}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <PlannerCoverPreview imageUrl={draft.coverImageUrl} />
        </div>

        <button
          className="mb-3 mt-1 self-end inline-flex shrink-0 items-center gap-2 rounded-[1.25rem] border-2 border-[#3a5d25] bg-[#b9e177] px-5 py-2.5 font-cursive text-[1.75rem] font-bold leading-none text-[#172612] shadow-[0_7px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 sm:mb-4 sm:px-6 sm:text-[2.1rem]"
          onClick={onContinue}
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
  draft,
  errors,
  onBack,
  onContinue,
  onDraftChange,
}: {
  draft: PlannerTripDraft;
  errors: PlannerTripDraftErrors;
  onBack: () => void;
  onContinue: () => void;
  onDraftChange: PlannerTripDraftChangeHandler;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="md:h-full md:w-1/2">
        <PlannerCreateTripPage draft={draft} errors={errors} onBack={onBack} onDraftChange={onDraftChange} />
      </div>
      <div className="md:h-full md:w-1/2">
        <PlannerDestinationPage draft={draft} errors={errors} onContinue={onContinue} onDraftChange={onDraftChange} />
      </div>
    </div>
  );
}

function PlannerSavedTripSpread({ onCreateNew, tripId }: { onCreateNew: () => void; tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activityMode, setActivityMode] = useState<SavedPlannerActivityMode>({ kind: 'list' });
  const [activityMutationError, setActivityMutationError] = useState<string | null>(null);
  const [activityMutationProgress, setActivityMutationProgress] = useState<string | null>(null);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [savedPlannerFeedback, setSavedPlannerFeedback] = useState<SavedPlannerFeedback | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const plannerQuery = useQuery({
    queryFn: ({ signal }) => getTripPlanner(tripId, { signal }),
    queryKey: plannerQueryKeys.detail(tripId),
  });
  const trip = plannerQuery.data?.trip;
  const activityNodes = (plannerQuery.data?.nodes ?? [])
    .filter((node) => node.type === 'activity')
    .sort((left, right) => {
      const leftSchedule = left.startAt ?? '';
      const rightSchedule = right.startAt ?? '';

      if (leftSchedule !== rightSchedule) {
        return leftSchedule.localeCompare(rightSchedule);
      }

      return left.sortOrder - right.sortOrder;
    });
  const editedActivityNode =
    activityMode.kind === 'edit' ? activityNodes.find((node) => node.id === activityMode.nodeId) : null;
  const reservedActivityTimes: PlannerActivityReservedTime[] = activityNodes
    .filter((node) => activityMode.kind !== 'edit' || node.id !== activityMode.nodeId)
    .map((node, index) => ({
      draft: buildActivityDraftFromPlanNode(node),
      label: node.title || t('trips.planner.board.activitySpread.activityNumber', { index: index + 1 }),
    }));
  const isActivityFormOpen = Boolean(trip) && Boolean(editedActivityNode);

  const clearActivityMutationState = () => {
    setActivityMutationError(null);
    setActivityMutationProgress(null);
  };

  const openEditActivityForm = (nodeId: string) => {
    clearActivityMutationState();
    setSavedPlannerFeedback(null);
    setActivityMode({ kind: 'edit', nodeId });
  };

  const closeActivityForm = () => {
    clearActivityMutationState();
    setActivityMode({ kind: 'list' });
  };

  const getSavedActivityServerErrorMessage = (serverError: PlannerActivityServerError) => {
    if (serverError.kind === 'missingTime') {
      return t('trips.planner.board.activitySpread.validation.serverTimeRequired');
    }

    if (serverError.kind === 'outsideTripRange') {
      return t('trips.planner.board.activitySpread.validation.dateOutsideTripRange', {
        endDate: formatPlannerDate(trip?.endDate ?? ''),
        startDate: formatPlannerDate(trip?.startDate ?? ''),
      });
    }

    if (serverError.kind === 'timeOverlap') {
      return t('trips.planner.board.activitySpread.validation.timeOverlapServer');
    }

    return t('trips.planner.board.activitySpread.validation.timeRangeInvalid');
  };

  const buildSavedActivityFailure = (
    activityIndex: number,
    error: unknown,
    feedbackKey:
      | 'trips.planner.board.savedSpread.feedback.activityCreateError'
      | 'trips.planner.board.savedSpread.feedback.activityUpdateError',
  ): PlannerActivityCreateResult => {
    const serverError = resolvePlannerActivityServerError(error);

    if (!serverError) {
      return {
        ok: false,
      };
    }

    const message = getSavedActivityServerErrorMessage(serverError);
    const errors: PlannerActivityDraftErrors = {
      [serverError.field]: message,
    };

    setActivityMutationError(
      t(feedbackKey, {
        index: activityIndex + 1,
        message,
      }),
    );

    return {
      activityError: {
        activityIndex,
        errors,
      },
      ok: false,
    };
  };

  const invalidateSavedPlanner = async () => {
    await queryClient.invalidateQueries({ queryKey: plannerQueryKeys.detail(tripId) });
  };

  const updateSavedActivity = async (activityDrafts: PlannerActivityDraft[]): Promise<PlannerActivityCreateResult> => {
    if (!trip || !editedActivityNode || isSavingActivity) {
      return { ok: false };
    }

    const [activityDraft, ...newActivityDrafts] = activityDrafts;

    if (!activityDraft) {
      return { ok: false };
    }

    setIsSavingActivity(true);
    setActivityMutationError(null);
    setSavedPlannerFeedback(null);
    setActivityMutationProgress(t('trips.planner.board.savedSpread.feedback.updateProgress'));

    try {
      const updatedNode = await updatePlanNode(editedActivityNode.id, buildActivityPlanNodeUpdatePayload(activityDraft));
      const createdNodes: PlanNode[] = [];

      for (const [newActivityIndex, newActivityDraft] of newActivityDrafts.entries()) {
        const activityIndex = newActivityIndex + 1;

        setActivityMutationProgress(
          t('trips.planner.board.savedSpread.feedback.createProgress', {
            current: newActivityIndex + 1,
            total: newActivityDrafts.length,
          }),
        );

        try {
          const createdNode = await createPlanNode(
            buildActivityPlanNodePayload(trip.id, newActivityDraft, activityNodes.length + newActivityIndex),
          );

          createdNodes.push(createdNode);
        } catch (error) {
          const createFailure = buildSavedActivityFailure(
            activityIndex,
            error,
            'trips.planner.board.savedSpread.feedback.activityCreateError',
          );

          if (!('activityError' in createFailure) || !createFailure.activityError) {
            setActivityMutationError(t('trips.planner.board.savedSpread.feedback.createError'));
          }

          return createFailure;
        }
      }

      queryClient.setQueryData<TripPlannerResult>(plannerQueryKeys.detail(trip.id), (currentPlanner) => ({
        trip: currentPlanner?.trip ?? trip,
        nodes: currentPlanner
          ? [
              ...currentPlanner.nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
              ...createdNodes,
            ]
          : [updatedNode, ...createdNodes],
      }));
      await invalidateSavedPlanner();
      setSavedPlannerFeedback({
        kind: 'success',
        message:
          createdNodes.length > 0
            ? t('trips.planner.board.savedSpread.feedback.updateWithCreateSuccess', {
                count: createdNodes.length,
              })
            : t('trips.planner.board.savedSpread.feedback.updateSuccess'),
      });
      setActivityMode({ kind: 'list' });

      return { ok: true };
    } catch (error) {
      const updateFailure = buildSavedActivityFailure(
        0,
        error,
        'trips.planner.board.savedSpread.feedback.activityUpdateError',
      );

      if (!('activityError' in updateFailure) || !updateFailure.activityError) {
        setActivityMutationError(t('trips.planner.board.savedSpread.feedback.updateError'));
      }

      return updateFailure;
    } finally {
      setIsSavingActivity(false);
      setActivityMutationProgress(null);
    }
  };

  const saveActivityForm = (activityDrafts: PlannerActivityDraft[]) => {
    return updateSavedActivity(activityDrafts);
  };

  const deleteSavedActivity = async (node: PlanNode) => {
    if (deletingNodeId) {
      return;
    }

    const shouldDelete = window.confirm(t('trips.planner.board.savedSpread.deleteConfirm'));

    if (!shouldDelete) {
      return;
    }

    setDeletingNodeId(node.id);
    setSavedPlannerFeedback(null);

    try {
      await deletePlanNode(node.id);
      queryClient.setQueryData<TripPlannerResult>(plannerQueryKeys.detail(tripId), (currentPlanner) =>
        currentPlanner
          ? {
              ...currentPlanner,
              nodes: currentPlanner.nodes.filter((currentNode) => currentNode.id !== node.id),
            }
          : currentPlanner,
      );
      await invalidateSavedPlanner();
      setSavedPlannerFeedback({
        kind: 'success',
        message: t('trips.planner.board.savedSpread.feedback.deleteSuccess'),
      });
    } catch {
      setSavedPlannerFeedback({
        kind: 'error',
        message: t('trips.planner.board.savedSpread.feedback.deleteError'),
      });
    } finally {
      setDeletingNodeId(null);
    }
  };

  if (trip && isActivityFormOpen) {
    const initialDrafts = editedActivityNode ? [buildActivityDraftFromPlanNode(editedActivityNode)] : undefined;

    return (
      <PlannerActivitySpread
        key={`edit-${editedActivityNode?.id}`}
        createError={activityMutationError}
        createProgressMessage={activityMutationProgress}
        createSuccessMessage={null}
        firstBackLabel={t('trips.planner.board.savedSpread.backToSavedPlannerAction')}
        initialDrafts={initialDrafts}
        isCreating={isSavingActivity}
        nodeId={editedActivityNode?.id ?? null}
        onBack={closeActivityForm}
        onCreateActivities={saveActivityForm}
        reservedActivityTimes={reservedActivityTimes}
        showAddActivityAction
        submitActionLabel={t('trips.planner.board.savedSpread.saveActivityAction')}
        submittingActionLabel={t('trips.planner.board.savedSpread.savingActivityAction')}
        tripDateRange={{
          endDate: trip.endDate,
          startDate: trip.startDate,
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div
        className="relative flex h-full min-h-[33rem] flex-col overflow-hidden border-b border-gray-100 bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:w-1/2 md:border-b-0 md:border-r lg:px-8"
        style={pageDotStyle}
      >
        <button
          className="relative z-40 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-4 py-2 font-hand text-[1.25rem] leading-none text-[#6b4938] shadow-[0_10px_18px_rgba(90,62,40,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#fff8ea] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 sm:text-[1.45rem]"
          onClick={onCreateNew}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
          {t('trips.planner.board.savedSpread.createNewAction')}
        </button>

        <PlannerTapeTitle className="mt-4">{t('trips.planner.board.savedSpread.stepTitle')}</PlannerTapeTitle>

        <div className="relative z-10 mt-7 flex min-h-0 flex-1 flex-col gap-4">
          {plannerQuery.isLoading ? (
            <p
              className="rounded-[0.85rem] border border-[#6aa7c7]/30 bg-[#eff9ff] px-4 py-3 font-marker text-[1rem] leading-tight text-[#24546d]"
              role="status"
            >
              {t('trips.planner.board.savedSpread.loading')}
            </p>
          ) : null}

          {!plannerQuery.isLoading && plannerQuery.isError ? (
            <p
              className="rounded-[0.85rem] border border-[#d92d20]/25 bg-[#fff1f0] px-4 py-3 font-marker text-[1rem] leading-tight text-[#b42318]"
              role="alert"
            >
              {t('trips.planner.board.savedSpread.loadError')}
            </p>
          ) : null}

          {trip ? (
            <>
              <div>
                <p className="font-cursive text-[1.65rem] font-bold leading-none text-[#201916] sm:text-[2rem]">
                  {trip.name}
                </p>
                <p className="mt-3 font-marker text-[1.05rem] leading-tight text-[#6b4938] sm:text-[1.18rem]">
                  {formatPlannerDate(trip.startDate)} - {formatPlannerDate(trip.endDate)}
                </p>
                {trip.destination ? (
                  <p className="mt-2 font-marker text-[1.05rem] leading-tight text-[#3d332b] sm:text-[1.18rem]">
                    {trip.destination}
                  </p>
                ) : null}
              </div>

              <div className="rounded-[0.95rem] border border-dashed border-[#b9aea0] bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                <p className="font-marker text-[1rem] font-bold text-[#6b4938]">
                  {t('trips.planner.board.savedSpread.summaryTitle')}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 font-marker text-[1rem] text-[#3d332b]">
                  <span>{t('trips.planner.board.savedSpread.activityCount', { count: activityNodes.length })}</span>
                  <span>{t(`trips.visibility.${trip.visibility}`)}</span>
                </div>
              </div>

              {trip.summaryNotes ? (
                <p className="min-h-0 overflow-y-auto rounded-[0.95rem] border border-[#e8dac7] bg-[#fff8ea] p-4 font-marker text-[1rem] leading-tight text-[#3d332b]">
                  {trip.summaryNotes}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div
        className="relative flex h-full min-h-[33rem] flex-col overflow-hidden bg-[#fffdfa] px-5 pb-8 pt-5 sm:px-7 sm:pb-9 sm:pt-6 md:w-1/2 lg:px-8"
        style={pageDotStyle}
      >
        <PlannerTapeTitle className="mt-1">{t('trips.planner.board.savedSpread.activitiesTitle')}</PlannerTapeTitle>

        <div className="relative z-10 mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {savedPlannerFeedback ? (
            <p
              className={cn(
                'rounded-[0.85rem] border px-4 py-3 font-marker text-[1rem] leading-tight',
                savedPlannerFeedback.kind === 'success'
                  ? 'border-[#6f9e44]/35 bg-[#f1ffd8] text-[#31521c]'
                  : 'border-[#d92d20]/25 bg-[#fff1f0] text-[#b42318]',
              )}
              role={savedPlannerFeedback.kind === 'success' ? 'status' : 'alert'}
            >
              {savedPlannerFeedback.message}
            </p>
          ) : null}

          {deletingNodeId ? (
            <p
              className="rounded-[0.85rem] border border-[#6aa7c7]/30 bg-[#eff9ff] px-4 py-3 font-marker text-[1rem] leading-tight text-[#24546d]"
              role="status"
            >
              {t('trips.planner.board.savedSpread.feedback.deleteProgress')}
            </p>
          ) : null}

          {trip && activityNodes.length === 0 ? (
            <p className="rounded-[0.85rem] border border-[#e8dac7] bg-[#fff8ea] px-4 py-4 font-marker text-[1rem] leading-tight text-[#6b4938]">
              {t('trips.planner.board.savedSpread.emptyActivities')}
            </p>
          ) : null}

          {activityNodes.map((node, index) => {
            const schedule = formatPlanNodeSchedule(node);
            const cost = formatPlanNodeCost(node);

            return (
              <article
                className="rounded-[0.95rem] border border-[#d8c5ab] bg-white/70 p-4 shadow-[0_8px_16px_rgba(90,62,40,0.08)]"
                key={node.id}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b9e177] font-marker text-[1rem] font-bold text-[#172612] shadow-[0_4px_0_#6f9e44]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-marker text-[1.1rem] font-bold leading-tight text-[#201916] sm:text-[1.2rem]">
                      {node.title}
                    </h2>
                    {schedule ? (
                      <p className="mt-1 font-marker text-[0.96rem] leading-tight text-[#6b4938]">{schedule}</p>
                    ) : null}
                  </div>
                </div>
                {node.notes ? (
                  <p className="mt-3 font-marker text-[0.96rem] leading-tight text-[#3d332b]">{node.notes}</p>
                ) : null}
                {cost ? (
                  <p className="mt-3 inline-flex rounded-full bg-[#f4cf8f]/55 px-3 py-1 font-marker text-[0.92rem] font-bold text-[#4d2d1b]">
                    {cost}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-3 py-1.5 font-marker text-[0.92rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 hover:bg-[#fff8ea] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
                    disabled={Boolean(deletingNodeId)}
                    onClick={() => openEditActivityForm(node.id)}
                    type="button"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2.3} />
                    {t('trips.planner.board.savedSpread.editActivityAction')}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-3 py-1.5 font-marker text-[0.92rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
                    disabled={Boolean(deletingNodeId)}
                    onClick={() => void deleteSavedActivity(node)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.3} />
                    {t('trips.planner.board.savedSpread.deleteActivityAction')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PlannerPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tripDraft, setTripDraft] = useState(createDefaultPlannerTripDraft);
  const [tripDraftErrors, setTripDraftErrors] = useState<PlannerTripDraftErrors>({});
  const [isCreatingTripWithActivities, setIsCreatingTripWithActivities] = useState(false);
  const [createTripWithActivitiesError, setCreateTripWithActivitiesError] = useState<string | null>(null);
  const [createTripWithActivitiesProgress, setCreateTripWithActivitiesProgress] = useState<string | null>(null);
  const [createTripWithActivitiesSuccess, setCreateTripWithActivitiesSuccess] = useState<string | null>(null);
  const plannerPage = searchParams.get('page');
  const selectedTripId = searchParams.get('tripId');
  const isCreatingPlan = plannerPage === 'next';
  const isEditingActivities = plannerPage === 'activities';
  const isViewingSavedPlanner = Boolean(selectedTripId) && !isCreatingPlan && !isEditingActivities;
  const isPlannerFlowOpen = isCreatingPlan || isEditingActivities || isViewingSavedPlanner;
  const activeNodeId = searchParams.get('nodeId');

  const updateTripDraft: PlannerTripDraftChangeHandler = (field, value) => {
    setTripDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
    setCreateTripWithActivitiesSuccess(null);
    setTripDraftErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      delete nextErrors[field];

      if (field === 'startDate' || field === 'endDate') {
        delete nextErrors.startDate;
        delete nextErrors.endDate;
      }

      if (field === 'budgetMode' || field === 'manualBudgetAmount' || field === 'manualBudgetCurrency') {
        delete nextErrors.manualBudgetAmount;
        delete nextErrors.manualBudgetCurrency;
      }

      return nextErrors;
    });
  };

  const validateTripDraft = () => {
    const nextErrors: PlannerTripDraftErrors = {};
    const coverImageUrl = tripDraft.coverImageUrl.trim();
    const summaryNotes = tripDraft.summaryNotes.trim();
    const manualBudgetAmount = tripDraft.manualBudgetAmount.trim();
    const manualBudgetCurrency = tripDraft.manualBudgetCurrency.trim();

    if (!tripDraft.name.trim()) {
      nextErrors.name = t('trips.validation.nameRequired');
    }

    if (!tripDraft.startDate) {
      nextErrors.startDate = t('trips.validation.startDateRequired');
    }

    if (!tripDraft.endDate) {
      nextErrors.endDate = t('trips.validation.endDateRequired');
    }

    if (tripDraft.startDate && tripDraft.endDate && tripDraft.endDate < tripDraft.startDate) {
      nextErrors.endDate = t('trips.validation.dateRangeInvalid');
    }

    if (summaryNotes.length > 2000) {
      nextErrors.summaryNotes = t('trips.validation.summaryNotesLength');
    }

    if (coverImageUrl && !isValidHttpUrl(coverImageUrl)) {
      nextErrors.coverImageUrl = t('trips.validation.coverImageUrlInvalid');
    }

    if (tripDraft.budgetMode === 'manual') {
      if (!manualBudgetAmount) {
        nextErrors.manualBudgetAmount = t('trips.validation.manualBudgetAmountRequired');
      } else if (Number(manualBudgetAmount) < 0) {
        nextErrors.manualBudgetAmount = t('trips.validation.manualBudgetAmountPositive');
      }

      if (!manualBudgetCurrency) {
        nextErrors.manualBudgetCurrency = t('trips.validation.manualBudgetCurrencyRequired');
      } else if (manualBudgetCurrency.length !== 3) {
        nextErrors.manualBudgetCurrency = t('trips.validation.manualBudgetCurrencyLength');
      }
    }

    return nextErrors;
  };

  const openNextPlannerPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', 'next');
    nextParams.delete('tripId');
    setSearchParams(nextParams, { replace: true });
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
    setCreateTripWithActivitiesSuccess(null);
  };

  const returnToIntroPlannerPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    nextParams.delete('tripId');
    setSearchParams(nextParams, { replace: true });
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
    setCreateTripWithActivitiesSuccess(null);
  };

  const openActivityPlannerPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', 'activities');
    nextParams.delete('tripId');
    setSearchParams(nextParams, { replace: true });
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
  };

  const openCreatedPlannerPage = (tripId: string) => {
    setSearchParams(
      {
        tripId,
      },
      { replace: true },
    );
    setTripDraft(createDefaultPlannerTripDraft());
    setTripDraftErrors({});
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
  };

  const openFreshPlannerDraft = () => {
    setSearchParams({}, { replace: true });
    setTripDraft(createDefaultPlannerTripDraft());
    setTripDraftErrors({});
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
    setCreateTripWithActivitiesSuccess(null);
  };

  const continueWithTripDraft = () => {
    const nextErrors = validateTripDraft();

    setTripDraftErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    openActivityPlannerPage();
  };

  const getActivityServerErrorMessage = (serverError: PlannerActivityServerError) => {
    if (serverError.kind === 'missingTime') {
      return t('trips.planner.board.activitySpread.validation.serverTimeRequired');
    }

    if (serverError.kind === 'outsideTripRange') {
      return t('trips.planner.board.activitySpread.validation.dateOutsideTripRange', {
        endDate: formatPlannerDate(tripDraft.endDate),
        startDate: formatPlannerDate(tripDraft.startDate),
      });
    }

    if (serverError.kind === 'timeOverlap') {
      return t('trips.planner.board.activitySpread.validation.timeOverlapServer');
    }

    return t('trips.planner.board.activitySpread.validation.timeRangeInvalid');
  };

  const buildActivityCreateFailure = (activityIndex: number, error: unknown): PlannerActivityCreateResult => {
    const serverError = resolvePlannerActivityServerError(error);

    if (!serverError) {
      return {
        ok: false,
      };
    }

    const message = getActivityServerErrorMessage(serverError);
    const errors: PlannerActivityDraftErrors = {
      [serverError.field]: message,
    };

    setCreateTripWithActivitiesError(
      t('trips.planner.board.activitySpread.feedback.activityCreateError', {
        index: activityIndex + 1,
        message,
      }),
    );

    return {
      activityError: {
        activityIndex,
        errors,
      },
      ok: false,
    };
  };

  const rollbackCreatedTrip = async (tripId: string) => {
    try {
      await deleteTrip(tripId);
    } catch {
      // The create flow should not hide the original activity error if cleanup fails.
    }
  };

  const createTripWithActivities = async (
    activityDrafts: PlannerActivityDraft[],
  ): Promise<PlannerActivityCreateResult> => {
    if (isCreatingTripWithActivities || createTripWithActivitiesSuccess) {
      return { ok: false };
    }

    const nextErrors = validateTripDraft();

    setTripDraftErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setCreateTripWithActivitiesError(t('trips.planner.board.activitySpread.feedback.tripDraftInvalid'));

      return { ok: false };
    }

    setIsCreatingTripWithActivities(true);
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(t('trips.planner.board.activitySpread.feedback.creatingTrip'));
    setCreateTripWithActivitiesSuccess(null);

    try {
      const trip = await createTrip(buildTripCreatePayload(tripDraft));
      const createdNodes: PlanNode[] = [];

      for (const [index, activityDraft] of activityDrafts.entries()) {
        setCreateTripWithActivitiesProgress(
          t('trips.planner.board.activitySpread.feedback.savingActivity', {
            current: index + 1,
            total: activityDrafts.length,
          }),
        );

        try {
          const createdNode = await createPlanNode(buildActivityPlanNodePayload(trip.id, activityDraft, index));

          createdNodes.push(createdNode);
        } catch (error) {
          await rollbackCreatedTrip(trip.id);

          const createFailure = buildActivityCreateFailure(index, error);

          if (!('activityError' in createFailure) || !createFailure.activityError) {
            setCreateTripWithActivitiesError(t('trips.planner.board.activitySpread.feedback.createError'));
          }

          return createFailure;
        }
      }

      queryClient.setQueryData(plannerQueryKeys.detail(trip.id), {
        nodes: createdNodes,
        trip,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'list'] }),
        queryClient.invalidateQueries({ queryKey: plannerQueryKeys.detail(trip.id) }),
      ]);
      setCreateTripWithActivitiesProgress(t('trips.planner.board.activitySpread.feedback.openingPlanner'));
      setCreateTripWithActivitiesSuccess(
        t('trips.planner.board.activitySpread.feedback.createSuccess', {
          count: activityDrafts.length,
          tripName: trip.name,
        }),
      );
      openCreatedPlannerPage(trip.id);

      return { ok: true };
    } catch {
      setCreateTripWithActivitiesError(t('trips.planner.board.activitySpread.feedback.createError'));

      return { ok: false };
    } finally {
      setIsCreatingTripWithActivities(false);
      setCreateTripWithActivitiesProgress(null);
    }
  };

  const returnToGeneralInfoPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', 'next');
    setSearchParams(nextParams, { replace: true });
    setCreateTripWithActivitiesError(null);
    setCreateTripWithActivitiesProgress(null);
    setCreateTripWithActivitiesSuccess(null);
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.planner}
      mainId="planner-content"
      scrollable={isPlannerFlowOpen}
    >
      <div className="flex h-full min-h-0 w-full items-stretch justify-center">
        <div className="relative w-full px-2 py-3 sm:px-2.5 sm:py-3 md:flex md:h-full md:min-h-0 md:items-center md:px-3 md:py-4 lg:px-3.5 lg:py-5">
          <div className="pointer-events-none absolute inset-x-0 top-3 bottom-3 z-0 md:top-4 md:bottom-4 lg:top-5 lg:bottom-5">
            <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 rounded-[1rem] bg-[linear-gradient(180deg,#d1ab7b_0%,#b68558_100%)] shadow-[0_16px_30px_rgba(76,51,33,0.16)] sm:-left-2 sm:-right-2 md:-left-2.5 md:-right-2.5" />
            <div className="absolute left-1 right-1 top-0 bottom-[0.06rem] rounded-[1rem] border border-[#e6d8bd] bg-[#efe2ca] shadow-[0_12px_20px_rgba(76,51,33,0.11)] sm:left-1.5 sm:right-[1.25rem] sm:bottom-[0.12rem] md:left-[1.75rem] md:right-[1.25rem] md:bottom-[0.16rem]" />
            <div className="absolute left-2 right-0.5 top-0 bottom-[0.16rem] rounded-[1rem] border border-[#efe5d2] bg-[#f5ebd8] shadow-[0_10px_16px_rgba(76,51,33,0.09)] sm:left-2.5 sm:right-[0.75rem] sm:bottom-[0.26rem] md:left-[2.75rem] md:right-[0.9rem] md:bottom-[0.34rem]" />
            <div className="absolute left-3 right-0 top-0 bottom-[0.28rem] rounded-[1rem] border border-[#f6efe1] bg-[#fbf5ea] shadow-[0_8px_14px_rgba(76,51,33,0.07)] sm:left-3.5 sm:bottom-[0.42rem] md:left-[4.25rem] md:bottom-[0.5rem]" />
          </div>

          <section className="relative w-full overflow-hidden rounded-[1rem] border border-[#efe2ca] bg-[#fffdf9] shadow-[0_20px_36px_rgba(0,0,0,0.09),0_8px_16px_rgba(0,0,0,0.06)] md:h-[min(100%,calc(100dvh-13.4rem))] md:min-h-[36rem] lg:h-[min(100%,calc(100dvh-14rem))]">
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-40 hidden w-20 -translate-x-1/2 bg-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_20%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.03)_80%,rgba(0,0,0,0)_100%)] md:block" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-[41] hidden w-px -translate-x-1/2 bg-black/10 md:block" />

            <div className="flex flex-col md:hidden">
              {isEditingActivities ? (
                <PlannerActivitySpread
                  createError={createTripWithActivitiesError}
                  createProgressMessage={createTripWithActivitiesProgress}
                  createSuccessMessage={createTripWithActivitiesSuccess}
                  isCreating={isCreatingTripWithActivities}
                  nodeId={activeNodeId}
                  onBack={returnToGeneralInfoPage}
                  onCreateActivities={createTripWithActivities}
                  tripDateRange={{
                    endDate: tripDraft.endDate,
                    startDate: tripDraft.startDate,
                  }}
                />
              ) : isCreatingPlan ? (
                <PlannerCreateSpread
                  draft={tripDraft}
                  errors={tripDraftErrors}
                  onBack={returnToIntroPlannerPage}
                  onContinue={continueWithTripDraft}
                  onDraftChange={updateTripDraft}
                />
              ) : isViewingSavedPlanner && selectedTripId ? (
                <PlannerSavedTripSpread onCreateNew={openFreshPlannerDraft} tripId={selectedTripId} />
              ) : (
                <>
                  <PlannerLeftPage />
                  <PlannerRightPageFront onCreatePlan={openNextPlannerPage} />
                </>
              )}
            </div>

            <div className="relative hidden h-full min-h-0 md:block">
              {isEditingActivities ? (
                <PlannerActivitySpread
                  createError={createTripWithActivitiesError}
                  createProgressMessage={createTripWithActivitiesProgress}
                  createSuccessMessage={createTripWithActivitiesSuccess}
                  isCreating={isCreatingTripWithActivities}
                  nodeId={activeNodeId}
                  onBack={returnToGeneralInfoPage}
                  onCreateActivities={createTripWithActivities}
                  tripDateRange={{
                    endDate: tripDraft.endDate,
                    startDate: tripDraft.startDate,
                  }}
                />
              ) : isCreatingPlan ? (
                <PlannerCreateSpread
                  draft={tripDraft}
                  errors={tripDraftErrors}
                  onBack={returnToIntroPlannerPage}
                  onContinue={continueWithTripDraft}
                  onDraftChange={updateTripDraft}
                />
              ) : isViewingSavedPlanner && selectedTripId ? (
                <PlannerSavedTripSpread onCreateNew={openFreshPlannerDraft} tripId={selectedTripId} />
              ) : (
                <div className="absolute inset-0 flex">
                  <div className="w-1/2">
                    <PlannerLeftPage />
                  </div>
                  <div className="w-1/2">
                    <PlannerRightPageFront onCreatePlan={openNextPlannerPage} />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
