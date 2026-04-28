import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { CalendarDays, ChevronLeft, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

type PlannerActivityDraft = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  budget: string;
  notes: string;
  activityType: string;
  bookingStatus: string;
  priority: string;
  referenceUrl: string;
  imageUrl: string;
};

type PlannerActivityDraftField = keyof PlannerActivityDraft;
type PlannerActivityDraftChangeHandler = <Field extends PlannerActivityDraftField>(
  field: Field,
  value: PlannerActivityDraft[Field],
) => void;

const activityTypeOptions = [
  'food',
  'sightseeing',
  'transport',
  'shopping',
  'rest',
  'other',
] as const;
const bookingStatusOptions = ['notNeeded', 'needBooking', 'booked'] as const;
const priorityOptions = ['flexible', 'preferred', 'mustDo'] as const;

const createDefaultActivityDraft = (): PlannerActivityDraft => ({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  budget: '',
  notes: '',
  activityType: 'sightseeing',
  bookingStatus: 'notNeeded',
  priority: 'preferred',
  referenceUrl: '',
  imageUrl: '',
});

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

function formatPlannerMonthTitle(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    return monthKey;
  }

  return `Tháng ${month}/${year}`;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hour = String(Math.floor(index / 2)).padStart(2, '0');
    const minute = index % 2 === 0 ? '00' : '30';

    return `${hour}:${minute}`;
  });
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

function PlannerStepProgress({
  currentStep,
}: {
  currentStep: number;
}) {
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

function PlannerActivityTextField({
  label,
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      {multiline ? (
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 px-4 py-3 font-marker text-[1.05rem] leading-tight text-[#3d332b] outline-none placeholder:text-[#71675c] focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className="mt-2 w-full rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 px-4 py-3 font-marker text-[1.05rem] text-[#3d332b] outline-none placeholder:text-[#71675c] focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}

function PlannerActivityDatePicker({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getPlannerMonthKey(value));
  const calendarDays = buildPlannerCalendarDays(visibleMonth);
  const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      <button
        aria-expanded={isOpen}
        className="mt-2 flex min-h-12 w-full items-center rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 px-4 py-3 text-left font-marker text-[1.05rem] text-[#3d332b] outline-none transition hover:bg-white/75 focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]"
        onClick={() => {
          setVisibleMonth(getPlannerMonthKey(value));
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <CalendarDays className="mr-3 h-5 w-5 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        {formatPlannerDate(value) || <span className="text-[#71675c]">Chọn ngày</span>}
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-[80] mt-3 rounded-[0.9rem] border border-[#b8a58e] bg-[#fffaf0] p-3 shadow-[0_18px_32px_rgba(59,44,32,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <button
              aria-label="Tháng trước"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#b8a58e] bg-white/70 font-marker text-[1.2rem] text-[#3d332b] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
              onClick={() => setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, -1))}
              type="button"
            >
              ‹
            </button>
            <p className="font-marker text-[1.05rem] font-bold text-[#3d332b]">
              {formatPlannerMonthTitle(visibleMonth)}
            </p>
            <button
              aria-label="Tháng sau"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#b8a58e] bg-white/70 font-marker text-[1.2rem] text-[#3d332b] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
              onClick={() => setVisibleMonth((currentMonth) => shiftPlannerMonth(currentMonth, 1))}
              type="button"
            >
              ›
            </button>
          </div>
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
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  {calendarDay.dayOfMonth}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlannerActivityTimePicker({
  endTime,
  label,
  onChange,
  startTime,
}: {
  endTime: string;
  label: string;
  onChange: (field: 'endTime' | 'startTime', value: string) => void;
  startTime: string;
}) {
  const timeOptions = getTimeOptions();

  return (
    <div>
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <label className="relative block">
          <span className="sr-only">Giờ bắt đầu</span>
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d5b4a]" />
          <select
            className="h-12 w-full appearance-none rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 pl-9 pr-3 font-marker text-[1.02rem] text-[#3d332b] outline-none focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20"
            onChange={(event) => onChange('startTime', event.target.value)}
            value={startTime}
          >
            <option value="">Bắt đầu</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <span className="font-marker text-[1.25rem] text-[#4f4138]">→</span>
        <label className="relative block">
          <span className="sr-only">Giờ kết thúc</span>
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d5b4a]" />
          <select
            className="h-12 w-full appearance-none rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 pl-9 pr-3 font-marker text-[1.02rem] text-[#3d332b] outline-none focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20"
            onChange={(event) => onChange('endTime', event.target.value)}
            value={endTime}
          >
            <option value="">Kết thúc</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function PlannerSegmentedField({
  label,
  onChange,
  options,
  translationPrefix,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  translationPrefix: string;
  value: string;
}) {
  const { t } = useI18n();

  return (
    <div>
      <p className="font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </p>
      <div className="mt-2 grid gap-2 rounded-[0.85rem] border border-[#b9aea0] bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                'rounded-[0.65rem] px-2.5 py-2 font-marker text-[1rem] leading-none transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                isSelected
                  ? 'bg-[#a8dfd5] text-[#1f2a24] shadow-[0_5px_0_rgba(80,115,104,0.2)]'
                  : 'text-[#65584b] hover:bg-[#fff7e8]',
              )}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {t(`${translationPrefix}.${option}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlannerActivityDetailsPage({
  draft,
  onBack,
  onDraftChange,
}: {
  draft: PlannerActivityDraft;
  onBack: () => void;
  onDraftChange: PlannerActivityDraftChangeHandler;
}) {
  const { t } = useI18n();

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
        {t('trips.planner.board.activitySpread.backToGeneralAction')}
      </button>

      <PlannerTapeTitle className="mt-4">
        {t('trips.planner.board.activitySpread.stepTitle')}
      </PlannerTapeTitle>

      <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5">
        <div className="sm:col-span-2">
          <PlannerActivityTextField
            label={t('trips.planner.board.activitySpread.fields.title')}
            onChange={(value) => onDraftChange('title', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.title')}
            value={draft.title}
          />
        </div>
        <PlannerActivityDatePicker
          label={t('trips.planner.board.activitySpread.fields.date')}
          onChange={(value) => onDraftChange('date', value)}
          value={draft.date}
        />
        <PlannerActivityTimePicker
          endTime={draft.endTime}
          label={t('trips.planner.board.activitySpread.fields.time')}
          onChange={onDraftChange}
          startTime={draft.startTime}
        />
        <PlannerActivityTextField
          label={t('trips.planner.board.activitySpread.fields.location')}
          onChange={(value) => onDraftChange('location', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.location')}
          value={draft.location}
        />
        <PlannerActivityTextField
          label={t('trips.planner.board.activitySpread.fields.budget')}
          onChange={(value) => onDraftChange('budget', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.budget')}
          value={draft.budget}
        />
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <PlannerStepProgress currentStep={2} />
      </div>
    </div>
  );
}

function PlannerActivitySupportPage({
  draft,
  onDraftChange,
}: {
  draft: PlannerActivityDraft;
  onDraftChange: PlannerActivityDraftChangeHandler;
}) {
  const { t } = useI18n();
  const imageUrl = draft.imageUrl.trim();
  const shouldShowImage = imageUrl && isValidHttpUrl(imageUrl);

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden bg-[#fffdfa] px-5 pb-8 pt-5 sm:px-7 sm:pb-9 sm:pt-6 md:min-h-0 lg:px-8"
      style={pageDotStyle}
    >
      <PlannerTapeTitle className="mt-1">
        {t('trips.planner.board.activitySpread.detailsTitle')}
      </PlannerTapeTitle>

      <div className="relative z-10 mt-6 flex flex-1 flex-col gap-4">
        <PlannerActivityTextField
          label={t('trips.planner.board.activitySpread.fields.notes')}
          multiline
          onChange={(value) => onDraftChange('notes', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.notes')}
          value={draft.notes}
        />
        <PlannerSegmentedField
          label={t('trips.planner.board.activitySpread.fields.activityType')}
          onChange={(value) => onDraftChange('activityType', value)}
          options={activityTypeOptions}
          translationPrefix="trips.planner.board.activitySpread.activityTypes"
          value={draft.activityType}
        />
        <PlannerSegmentedField
          label={t('trips.planner.board.activitySpread.fields.bookingStatus')}
          onChange={(value) => onDraftChange('bookingStatus', value)}
          options={bookingStatusOptions}
          translationPrefix="trips.planner.board.activitySpread.bookingStatuses"
          value={draft.bookingStatus}
        />
        <PlannerSegmentedField
          label={t('trips.planner.board.activitySpread.fields.priority')}
          onChange={(value) => onDraftChange('priority', value)}
          options={priorityOptions}
          translationPrefix="trips.planner.board.activitySpread.priorities"
          value={draft.priority}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <PlannerActivityTextField
            label={t('trips.planner.board.activitySpread.fields.referenceUrl')}
            onChange={(value) => onDraftChange('referenceUrl', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.referenceUrl')}
            value={draft.referenceUrl}
          />
          <PlannerActivityTextField
            label={t('trips.planner.board.activitySpread.fields.imageUrl')}
            onChange={(value) => onDraftChange('imageUrl', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.imageUrl')}
            value={draft.imageUrl}
          />
        </div>
        <div className="relative h-24 shrink-0 overflow-hidden rounded-[1.1rem] border border-dashed border-[#b9aea0] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:h-28">
          {shouldShowImage ? (
            <img
              alt={t('trips.planner.board.activitySpread.imagePreviewAlt')}
              className="absolute inset-0 h-full w-full object-cover"
              src={imageUrl}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PlannerActivitySpread({
  onBack,
}: {
  nodeId: string | null;
  onBack: () => void;
}) {
  const [activityDraft, setActivityDraft] = useState(createDefaultActivityDraft);

  const updateActivityDraft: PlannerActivityDraftChangeHandler = (field, value) => {
    setActivityDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="md:h-full md:w-1/2">
        <PlannerActivityDetailsPage
          draft={activityDraft}
          onBack={onBack}
          onDraftChange={updateActivityDraft}
        />
      </div>
      <div className="md:h-full md:w-1/2">
        <PlannerActivitySupportPage
          draft={activityDraft}
          onDraftChange={updateActivityDraft}
        />
      </div>
    </div>
  );
}
