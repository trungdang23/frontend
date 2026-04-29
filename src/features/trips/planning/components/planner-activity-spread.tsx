import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Plus,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

export type PlannerActivityDraft = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  costAmount: string;
  costCurrency: string;
  notes: string;
  imageUrl: string;
};

type PlannerActivityDraftField = keyof PlannerActivityDraft;
type PlannerActivityDraftErrorField = PlannerActivityDraftField | 'time';
type PlannerActivityDraftErrors = Partial<Record<PlannerActivityDraftErrorField, string>>;
type PlannerActivityPageTurnDirection = 'next' | 'previous';
type PlannerActivityTripDateRange = {
  endDate: string;
  startDate: string;
};
type PlannerActivityDraftChangeHandler = <Field extends PlannerActivityDraftField>(
  field: Field,
  value: PlannerActivityDraft[Field],
) => void;

const createDefaultActivityDraft = (): PlannerActivityDraft => ({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  costAmount: '',
  costCurrency: 'VND',
  notes: '',
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

function getPlannerTimeInMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function doPlannerActivityTimesOverlap(
  firstActivity: PlannerActivityDraft,
  secondActivity: PlannerActivityDraft,
) {
  if (
    firstActivity.date !== secondActivity.date ||
    !firstActivity.startTime ||
    !firstActivity.endTime ||
    !secondActivity.startTime ||
    !secondActivity.endTime
  ) {
    return false;
  }

  const firstStart = getPlannerTimeInMinutes(firstActivity.startTime);
  const firstEnd = getPlannerTimeInMinutes(firstActivity.endTime);
  const secondStart = getPlannerTimeInMinutes(secondActivity.startTime);
  const secondEnd = getPlannerTimeInMinutes(secondActivity.endTime);

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null
  ) {
    return false;
  }

  return firstStart < secondEnd && secondStart < firstEnd;
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

function PlannerActivityFieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 font-marker text-[0.98rem] leading-tight text-[#b42318]" id={id} role="alert">
      {message}
    </p>
  );
}

function PlannerActivityTextField({
  error,
  inputMode,
  label,
  maxLength,
  multiline = false,
  onChange,
  placeholder,
  transformValue,
  value,
}: {
  error?: string;
  inputMode?: 'decimal' | 'numeric' | 'text';
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  transformValue?: (value: string) => string;
  value: string;
}) {
  const errorId = error ? `${label.replace(/\W+/g, '-').toLowerCase()}-error` : undefined;

  return (
    <label className="block">
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      {multiline ? (
        <textarea
          aria-describedby={errorId}
          className={cn(
            'mt-2 min-h-24 w-full resize-none rounded-[0.8rem] border border-dashed bg-white/60 px-4 py-3 font-marker text-[1.05rem] leading-tight text-[#3d332b] outline-none placeholder:text-[#71675c] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]',
            error ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
          )}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          aria-describedby={errorId}
          className={cn(
            'mt-2 w-full rounded-[0.8rem] border border-dashed bg-white/60 px-4 py-3 font-marker text-[1.05rem] text-[#3d332b] outline-none placeholder:text-[#71675c] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]',
            error ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
          )}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(event) => {
            const nextValue = transformValue
              ? transformValue(event.target.value)
              : event.target.value;

            onChange(nextValue);
          }}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
      <PlannerActivityFieldError id={errorId} message={error} />
    </label>
  );
}

function PlannerActivityDatePicker({
  error,
  label,
  onChange,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getPlannerMonthKey(value));
  const calendarDays = buildPlannerCalendarDays(visibleMonth);
  const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const errorId = error ? `${label.replace(/\W+/g, '-').toLowerCase()}-error` : undefined;

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
        aria-describedby={errorId}
        aria-expanded={isOpen}
        className={cn(
          'mt-2 flex min-h-12 w-full items-center rounded-[0.8rem] border border-dashed bg-white/60 px-4 py-3 text-left font-marker text-[1.05rem] text-[#3d332b] outline-none transition hover:bg-white/75 focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]',
          error ? 'border-[#d92d20]' : 'border-[#b9aea0] focus:border-[#7c6a58]',
        )}
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
      <PlannerActivityFieldError id={errorId} message={error} />
    </div>
  );
}

function PlannerActivityTimePicker({
  endTime,
  error,
  label,
  onChange,
  startTime,
}: {
  endTime: string;
  error?: string;
  label: string;
  onChange: (field: 'endTime' | 'startTime', value: string) => void;
  startTime: string;
}) {
  const { t } = useI18n();
  const errorId = error ? `${label.replace(/\W+/g, '-').toLowerCase()}-error` : undefined;

  return (
    <div>
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      <div
        aria-describedby={errorId}
        className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"
      >
        <PlannerActivityTimeSelect
          ariaLabel={t('trips.planner.board.activitySpread.fields.startTime')}
          onChange={(value) => onChange('startTime', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.startTime')}
          value={startTime}
        />
        <span className="font-marker text-[1.25rem] text-[#4f4138]">→</span>
        <PlannerActivityTimeSelect
          ariaLabel={t('trips.planner.board.activitySpread.fields.endTime')}
          onChange={(value) => onChange('endTime', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.endTime')}
          value={endTime}
        />
      </div>
      <PlannerActivityFieldError id={errorId} message={error} />
    </div>
  );
}

function PlannerActivityTimeSelect({
  ariaLabel,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeOptions = getTimeOptions();

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
      <button
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="flex h-12 w-full items-center rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 pl-3 pr-2 text-left font-marker text-[1rem] text-[#3d332b] outline-none transition hover:bg-white/75 focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.06rem]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Clock className="mr-2 h-4 w-4 shrink-0 text-[#6d5b4a]" strokeWidth={1.7} />
        <span className={cn('min-w-0 truncate', value ? undefined : 'text-[#71675c]')}>
          {value || placeholder}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-[90] mt-2 max-h-44 overflow-y-auto rounded-[0.85rem] border border-[#b8a58e] bg-[#fffaf0] p-1.5 shadow-[0_16px_28px_rgba(59,44,32,0.2)]">
          <button
            className={cn(
              'w-full rounded-[0.6rem] px-3 py-2 text-left font-marker text-[0.98rem] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
              value
                ? 'text-[#70665d] hover:bg-white/80'
                : 'bg-[#a8dfd5] font-bold text-[#1f2a24]',
            )}
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            type="button"
          >
            {placeholder}
          </button>
          {timeOptions.map((time) => {
            const isSelected = value === time;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  'w-full rounded-[0.6rem] px-3 py-2 text-left font-marker text-[0.98rem] transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                  isSelected
                    ? 'bg-[#b9e177] font-bold text-[#172612] shadow-[0_3px_0_#6f9e44]'
                    : 'text-[#3d332b] hover:bg-white/80',
                )}
                key={time}
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                type="button"
              >
                {time}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PlannerActivityDetailsPage({
  activityNumber,
  backLabel,
  draft,
  errors,
  onBack,
  onDraftChange,
}: {
  activityNumber: number;
  backLabel: string;
  draft: PlannerActivityDraft;
  errors: PlannerActivityDraftErrors;
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
        {backLabel}
      </button>

      <PlannerTapeTitle className="mt-4">
        {t('trips.planner.board.activitySpread.stepTitle')}
      </PlannerTapeTitle>
      <p className="mt-3 text-center font-marker text-[1.05rem] font-bold text-[#6b4938] sm:text-[1.2rem]">
        {t('trips.planner.board.activitySpread.activityNumber', {
          index: activityNumber,
        })}
      </p>

      <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-5">
        <div className="sm:col-span-2">
          <PlannerActivityTextField
            error={errors.title}
            label={t('trips.planner.board.activitySpread.fields.title')}
            onChange={(value) => onDraftChange('title', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.title')}
            value={draft.title}
          />
        </div>
        <PlannerActivityDatePicker
          error={errors.date}
          label={t('trips.planner.board.activitySpread.fields.date')}
          onChange={(value) => onDraftChange('date', value)}
          value={draft.date}
        />
        <PlannerActivityTimePicker
          endTime={draft.endTime}
          error={errors.time ?? errors.startTime ?? errors.endTime}
          label={t('trips.planner.board.activitySpread.fields.time')}
          onChange={onDraftChange}
          startTime={draft.startTime}
        />
        <PlannerActivityTextField
          error={errors.location}
          label={t('trips.planner.board.activitySpread.fields.location')}
          onChange={(value) => onDraftChange('location', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.location')}
          value={draft.location}
        />
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <PlannerActivityTextField
            error={errors.costAmount}
            inputMode="decimal"
            label={t('trips.planner.board.activitySpread.fields.costAmount')}
            onChange={(value) => onDraftChange('costAmount', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.costAmount')}
            transformValue={(value) => value.replace(/\D/g, '')}
            value={draft.costAmount}
          />
          <PlannerActivityTextField
            error={errors.costCurrency}
            inputMode="text"
            label={t('trips.planner.board.activitySpread.fields.costCurrency')}
            maxLength={3}
            onChange={(value) => onDraftChange('costCurrency', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.costCurrency')}
            transformValue={(value) => value.toUpperCase()}
            value={draft.costCurrency}
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <PlannerStepProgress currentStep={2} />
      </div>
    </div>
  );
}

function PlannerActivitySupportPage({
  createError,
  createSuccessMessage,
  draft,
  errors,
  isCreating,
  onAddActivity,
  onCreate,
  onDraftChange,
}: {
  createError: string | null;
  createSuccessMessage: string | null;
  draft: PlannerActivityDraft;
  errors: PlannerActivityDraftErrors;
  isCreating: boolean;
  onAddActivity: () => void;
  onCreate: () => void;
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
      <div className="relative z-20 min-h-14 pr-14 sm:pr-36">
        <PlannerTapeTitle className="mt-1">
          {t('trips.planner.board.activitySpread.detailsTitle')}
        </PlannerTapeTitle>
        <button
          aria-label={t('trips.planner.board.activitySpread.addActivityAction')}
          className="absolute right-0 top-0 inline-flex h-10 items-center gap-1.5 rounded-full border border-[#3a5d25]/45 bg-[#b9e177] px-3 font-marker text-[0.98rem] font-bold leading-none text-[#172612] shadow-[0_6px_0_#6f9e44,0_12px_20px_rgba(55,83,34,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 sm:h-11 sm:px-4 sm:text-[1.08rem]"
          onClick={onAddActivity}
          type="button"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">{t('trips.planner.board.activitySpread.addActivityAction')}</span>
        </button>
      </div>

      <div className="relative z-10 mt-3 flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <PlannerActivityTextField
            error={errors.imageUrl}
            label={t('trips.planner.board.activitySpread.fields.imageUrl')}
            onChange={(value) => onDraftChange('imageUrl', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.imageUrl')}
            value={draft.imageUrl}
          />
          <div className="relative h-32 shrink-0 overflow-hidden rounded-[1.1rem] border border-dashed border-[#b9aea0] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:h-36 lg:h-40">
            {shouldShowImage ? (
              <>
                <img
                  alt={t('trips.planner.board.activitySpread.imagePreviewAlt')}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={imageUrl}
                />
                <span className="pointer-events-none absolute left-1/2 top-0 h-7 w-24 -translate-x-1/2 -translate-y-2 -rotate-2 bg-[#f4cf8f]/55 shadow-[0_4px_8px_rgba(90,62,40,0.12)] backdrop-blur-[1px]" />
              </>
            ) : null}
          </div>
          <PlannerActivityTextField
            error={errors.notes}
            label={t('trips.planner.board.activitySpread.fields.notes')}
            multiline
            onChange={(value) => onDraftChange('notes', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.notes')}
            value={draft.notes}
          />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 pt-4">
          {createError ? (
            <p className="w-full rounded-[0.85rem] border border-[#d92d20]/25 bg-[#fff1f0] px-4 py-3 font-marker text-[1rem] leading-tight text-[#b42318]" role="alert">
              {createError}
            </p>
          ) : null}
          {createSuccessMessage ? (
            <p className="w-full rounded-[0.85rem] border border-[#6f9e44]/35 bg-[#f1ffd8] px-4 py-3 font-marker text-[1rem] leading-tight text-[#31521c]" role="status">
              {createSuccessMessage}
            </p>
          ) : null}
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-[1.25rem] border-2 border-[#3a5d25] bg-[#b9e177] px-5 py-2.5 font-cursive text-[1.75rem] font-bold leading-none text-[#172612] shadow-[0_7px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 sm:px-6 sm:text-[2.1rem]"
            disabled={isCreating || Boolean(createSuccessMessage)}
            onClick={onCreate}
            type="button"
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
            {isCreating
              ? t('trips.planner.board.activitySpread.creatingAction')
              : t('trips.planner.board.activitySpread.createAction')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlannerActivitySpread({
  createError,
  createSuccessMessage,
  isCreating,
  onBack,
  onCreateActivities,
  tripDateRange,
}: {
  createError: string | null;
  createSuccessMessage: string | null;
  isCreating: boolean;
  nodeId: string | null;
  onBack: () => void;
  onCreateActivities: (drafts: PlannerActivityDraft[]) => Promise<boolean>;
  tripDateRange: PlannerActivityTripDateRange;
}) {
  const [activityDrafts, setActivityDrafts] = useState<PlannerActivityDraft[]>(() => [
    createDefaultActivityDraft(),
  ]);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [activityDraftErrors, setActivityDraftErrors] = useState<
    Record<number, PlannerActivityDraftErrors>
  >({});
  const [pageTurnDirection, setPageTurnDirection] =
    useState<PlannerActivityPageTurnDirection | null>(null);
  const pageTurnTimeoutRef = useRef<number | null>(null);
  const { t } = useI18n();
  const activityDraft = activityDrafts[activeActivityIndex] ?? createDefaultActivityDraft();
  const currentActivityErrors = activityDraftErrors[activeActivityIndex] ?? {};

  useEffect(() => {
    return () => {
      if (pageTurnTimeoutRef.current !== null) {
        window.clearTimeout(pageTurnTimeoutRef.current);
      }
    };
  }, []);

  const startPageTurn = (
    direction: PlannerActivityPageTurnDirection,
    updateActivePage: () => void,
  ) => {
    if (pageTurnTimeoutRef.current !== null) {
      window.clearTimeout(pageTurnTimeoutRef.current);
    }

    setPageTurnDirection(direction);
    updateActivePage();
    pageTurnTimeoutRef.current = window.setTimeout(() => {
      setPageTurnDirection(null);
      pageTurnTimeoutRef.current = null;
    }, 720);
  };

  const updateActivityDraft: PlannerActivityDraftChangeHandler = (field, value) => {
    setActivityDrafts((currentDrafts) =>
      currentDrafts.map((currentDraft, index) =>
        index === activeActivityIndex
          ? {
              ...currentDraft,
              [field]: value,
            }
          : currentDraft,
      ),
    );
    setActivityDraftErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const nextActiveErrors = { ...(nextErrors[activeActivityIndex] ?? {}) };

      delete nextActiveErrors[field];

      if (field === 'startTime' || field === 'endTime') {
        delete nextActiveErrors.time;
      }

      if (field === 'costAmount' || field === 'costCurrency') {
        delete nextActiveErrors.costAmount;
        delete nextActiveErrors.costCurrency;
      }

      nextErrors[activeActivityIndex] = nextActiveErrors;

      return nextErrors;
    });
  };

  const validateActivityDraft = (draft: PlannerActivityDraft) => {
    const nextErrors: PlannerActivityDraftErrors = {};
    const title = draft.title.trim();
    const costAmount = draft.costAmount.trim();
    const costCurrency = draft.costCurrency.trim();
    const notes = draft.notes.trim();
    const imageUrl = draft.imageUrl.trim();

    if (!title) {
      nextErrors.title = t('trips.planner.board.activitySpread.validation.titleRequired');
    }

    if (!draft.date) {
      nextErrors.date = t('trips.planner.board.activitySpread.validation.dateRequired');
    } else if (
      tripDateRange.startDate &&
      tripDateRange.endDate &&
      (draft.date < tripDateRange.startDate || draft.date > tripDateRange.endDate)
    ) {
      nextErrors.date = t('trips.planner.board.activitySpread.validation.dateOutsideTripRange', {
        endDate: formatPlannerDate(tripDateRange.endDate),
        startDate: formatPlannerDate(tripDateRange.startDate),
      });
    }

    if (!draft.startTime) {
      nextErrors.startTime = t('trips.planner.board.activitySpread.validation.startTimeRequired');
    }

    if (!draft.endTime) {
      nextErrors.endTime = t('trips.planner.board.activitySpread.validation.endTimeRequired');
    }

    if (draft.startTime && draft.endTime && draft.endTime <= draft.startTime) {
      nextErrors.time = t('trips.planner.board.activitySpread.validation.timeRangeInvalid');
    }

    if (costAmount && Number(costAmount) < 0) {
      nextErrors.costAmount = t('trips.planner.board.activitySpread.validation.costAmountInvalid');
    }

    if (costAmount && !costCurrency) {
      nextErrors.costCurrency = t('trips.planner.board.activitySpread.validation.costCurrencyRequired');
    } else if (costAmount && costCurrency.length !== 3) {
      nextErrors.costCurrency = t('trips.planner.board.activitySpread.validation.costCurrencyLength');
    }

    if (notes.length > 4000) {
      nextErrors.notes = t('trips.planner.board.activitySpread.validation.notesLength');
    }

    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      nextErrors.imageUrl = t('trips.planner.board.activitySpread.validation.imageUrlInvalid');
    }

    return nextErrors;
  };

  const validateActivityDrafts = () => {
    const nextErrors = activityDrafts.reduce<Record<number, PlannerActivityDraftErrors>>(
      (errorsByIndex, draft, index) => {
        const errors = validateActivityDraft(draft);

        if (Object.keys(errors).length > 0) {
          errorsByIndex[index] = errors;
        }

        return errorsByIndex;
      },
      {},
    );

    activityDrafts.forEach((currentDraft, currentIndex) => {
      activityDrafts.forEach((otherDraft, otherIndex) => {
        if (currentIndex >= otherIndex) {
          return;
        }

        if (!doPlannerActivityTimesOverlap(currentDraft, otherDraft)) {
          return;
        }

        nextErrors[currentIndex] = {
          ...(nextErrors[currentIndex] ?? {}),
          time: t('trips.planner.board.activitySpread.validation.timeOverlap', {
            index: otherIndex + 1,
          }),
        };
        nextErrors[otherIndex] = {
          ...(nextErrors[otherIndex] ?? {}),
          time: t('trips.planner.board.activitySpread.validation.timeOverlap', {
            index: currentIndex + 1,
          }),
        };
      });
    });

    return nextErrors;
  };

  const addActivityDraft = () => {
    startPageTurn('next', () => {
      setActivityDrafts((currentDrafts) => [...currentDrafts, createDefaultActivityDraft()]);
      setActiveActivityIndex(activityDrafts.length);
    });
  };

  const goToPreviousActivityDraft = () => {
    if (activeActivityIndex === 0) {
      onBack();
      return;
    }

    startPageTurn('previous', () => {
      setActiveActivityIndex((currentIndex) => Math.max(0, currentIndex - 1));
    });
  };

  const createActivities = async () => {
    if (isCreating || createSuccessMessage) {
      return;
    }

    const nextErrors = validateActivityDrafts();
    const firstErrorIndex = Number(Object.keys(nextErrors)[0]);

    setActivityDraftErrors(nextErrors);

    if (Number.isInteger(firstErrorIndex)) {
      setActiveActivityIndex(firstErrorIndex);
      return;
    }

    await onCreateActivities(activityDrafts);
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <div className="md:h-full md:w-1/2">
          <PlannerActivityDetailsPage
            activityNumber={activeActivityIndex + 1}
            backLabel={
              activeActivityIndex === 0
                ? t('trips.planner.board.activitySpread.backToGeneralAction')
                : t('trips.planner.board.activitySpread.backToPreviousActivityAction')
            }
            draft={activityDraft}
            errors={currentActivityErrors}
            onBack={goToPreviousActivityDraft}
            onDraftChange={updateActivityDraft}
          />
        </div>
        <div className="md:h-full md:w-1/2">
          <PlannerActivitySupportPage
            createError={createError}
            createSuccessMessage={createSuccessMessage}
            draft={activityDraft}
            errors={currentActivityErrors}
            isCreating={isCreating}
            onAddActivity={addActivityDraft}
            onCreate={createActivities}
            onDraftChange={updateActivityDraft}
          />
        </div>
      </div>
      <PlannerActivityPageTurnOverlay direction={pageTurnDirection} />
    </div>
  );
}

function PlannerActivityPageTurnOverlay({
  direction,
}: {
  direction: PlannerActivityPageTurnDirection | null;
}) {
  if (!direction) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[70] hidden w-1/2 md:block [perspective:1500px]">
      <div
        className={cn(
          'h-full w-full origin-left border-l border-[#dacdb6] bg-[#fffdfa] shadow-[0_18px_32px_rgba(69,48,34,0.18)] [backface-visibility:hidden] [transform-style:preserve-3d]',
          direction === 'next'
            ? 'planner-activity-page-turn-next'
            : 'planner-activity-page-turn-previous',
        )}
        style={pageDotStyle}
      />
    </div>
  );
}
