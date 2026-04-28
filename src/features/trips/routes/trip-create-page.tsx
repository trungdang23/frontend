import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Eye, WalletCards } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createTrip } from '@/features/trips/api/trips-api';
import type { TripBudgetMode, TripUpsertPayload, TripVisibility } from '@/features/trips/types/trip';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';

type TripFormState = {
  name: string;
  destination: string;
  summaryNotes: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  timezone: string;
  budgetMode: TripBudgetMode;
  manualBudgetAmount: string;
  manualBudgetCurrency: string;
  visibility: TripVisibility;
};

const initialTripFormState: TripFormState = {
  name: '',
  destination: '',
  summaryNotes: '',
  coverImageUrl: '',
  startDate: '',
  endDate: '',
  timezone: 'Asia/Ho_Chi_Minh',
  budgetMode: 'auto',
  manualBudgetAmount: '',
  manualBudgetCurrency: 'VND',
  visibility: 'private',
};

function normalizeOptionalText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function parseWholeAmount(value: string) {
  const normalizedValue = value.replace(/[^\d]/g, '');

  if (!normalizedValue) {
    return null;
  }

  return Number.parseInt(normalizedValue, 10);
}

function buildTripPayload(formState: TripFormState): TripUpsertPayload {
  const manualBudgetAmount =
    formState.budgetMode === 'manual'
      ? parseWholeAmount(formState.manualBudgetAmount)
      : null;
  const manualBudgetCurrency =
    formState.budgetMode === 'manual'
      ? formState.manualBudgetCurrency.trim().toUpperCase()
      : null;

  return {
    name: formState.name.trim(),
    destination: normalizeOptionalText(formState.destination),
    summaryNotes: normalizeOptionalText(formState.summaryNotes),
    coverImageUrl: normalizeOptionalText(formState.coverImageUrl),
    startDate: formState.startDate,
    endDate: formState.endDate,
    timezone: normalizeOptionalText(formState.timezone),
    budgetMode: formState.budgetMode,
    manualBudgetAmount,
    manualBudgetCurrency,
    visibility: formState.visibility,
  };
}

function TripInput({
  label,
  onChange,
  placeholder,
  required,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="font-hand text-[1.45rem] font-bold leading-none text-[#251b15]">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/68 px-4 py-3 text-sm text-[#2f241e] outline-none placeholder:text-[#7a6d60] focus:border-[#7c6a58] focus:bg-white focus:ring-2 focus:ring-[#b88a56]/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

export function TripCreatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<TripFormState>(initialTripFormState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewTitle = formState.name.trim() || t('trips.preview.titleFallback');
  const dateRangePreview = useMemo(() => {
    if (!formState.startDate && !formState.endDate) {
      return t('trips.fields.dateRange');
    }

    return `${formState.startDate || '...'} -> ${formState.endDate || '...'}`;
  }, [formState.endDate, formState.startDate, t]);

  const updateField = <TField extends keyof TripFormState>(
    field: TField,
    value: TripFormState[TField],
  ) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (formState.endDate < formState.startDate) {
      setSubmitError(t('trips.validation.dateRangeInvalid'));
      return;
    }

    if (formState.budgetMode === 'manual') {
      const amount = parseWholeAmount(formState.manualBudgetAmount);

      if (amount === null) {
        setSubmitError(t('trips.validation.manualBudgetAmountRequired'));
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const trip = await createTrip(buildTripPayload(formState));

      navigate(`/app/trips/${trip.id}/planner?page=activities`, {
        replace: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message || t('trips.feedback.createError'));
      } else {
        setSubmitError(t('trips.feedback.createError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.trips}
      mainId="trip-create-content"
      scrollable
    >
      <div className="mb-5">
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-4 py-2 text-sm font-bold text-[#6b4938] transition hover:-translate-y-0.5"
          to="/app/trips"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('trips.actions.backToList')}
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <form
          className="rounded-[1rem] border border-[#d8c5a7] bg-[#fff9ee]/92 p-5 shadow-[0_18px_32px_rgba(92,66,43,0.12)] sm:p-7"
          onSubmit={handleSubmit}
        >
          <p className="section-label">{t('trips.createEyebrow')}</p>
          <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-[#261b15] sm:text-[3rem]">
            {t('trips.createTitle')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#66594d] sm:text-base">
            {t('trips.createDescription')}
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TripInput
                label={t('trips.fields.name')}
                onChange={(value) => updateField('name', value)}
                placeholder={t('trips.planner.board.createSpread.tripNamePlaceholder')}
                required
                value={formState.name}
              />
            </div>
            <TripInput
              label={t('trips.fields.destination')}
              onChange={(value) => updateField('destination', value)}
              placeholder={t('trips.planner.board.createSpread.destinationSearchPlaceholder')}
              value={formState.destination}
            />
            <TripInput
              label={t('trips.fields.timezone')}
              onChange={(value) => updateField('timezone', value)}
              placeholder="Asia/Ho_Chi_Minh"
              value={formState.timezone}
            />
            <TripInput
              label={t('trips.fields.startDate')}
              onChange={(value) => updateField('startDate', value)}
              required
              type="date"
              value={formState.startDate}
            />
            <TripInput
              label={t('trips.fields.endDate')}
              onChange={(value) => updateField('endDate', value)}
              required
              type="date"
              value={formState.endDate}
            />
            <div className="sm:col-span-2">
              <TripInput
                label={t('trips.fields.coverImageUrl')}
                onChange={(value) => updateField('coverImageUrl', value)}
                placeholder={t('trips.placeholders.coverImageUrl')}
                type="url"
                value={formState.coverImageUrl}
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="font-hand text-[1.45rem] font-bold leading-none text-[#251b15]">
                {t('trips.fields.summaryNotes')}
              </span>
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/68 px-4 py-3 text-sm leading-7 text-[#2f241e] outline-none placeholder:text-[#7a6d60] focus:border-[#7c6a58] focus:bg-white focus:ring-2 focus:ring-[#b88a56]/20"
                onChange={(event) => updateField('summaryNotes', event.target.value)}
                placeholder={t('trips.placeholders.summaryNotes')}
                value={formState.summaryNotes}
              />
            </label>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <fieldset className="rounded-[0.9rem] border border-[#d8c5a7] bg-white/58 p-4">
              <legend className="flex items-center gap-2 px-1 font-hand text-[1.4rem] font-bold text-[#251b15]">
                <WalletCards className="h-4 w-4" />
                {t('trips.fields.budgetMode')}
              </legend>
              <div className="mt-3 grid gap-2">
                {(['auto', 'manual'] as const).map((mode) => (
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#4d4037]" key={mode}>
                    <input
                      checked={formState.budgetMode === mode}
                      onChange={() => updateField('budgetMode', mode)}
                      type="radio"
                    />
                    {mode === 'auto' ? t('trips.budget.modeAuto') : t('trips.budget.modeManual')}
                  </label>
                ))}
              </div>
              {formState.budgetMode === 'manual' ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_6rem]">
                  <input
                    className="rounded-[0.7rem] border border-dashed border-[#b9aea0] bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b88a56]/20"
                    inputMode="numeric"
                    onChange={(event) => updateField('manualBudgetAmount', event.target.value)}
                    placeholder="5000000"
                    value={formState.manualBudgetAmount}
                  />
                  <input
                    className="rounded-[0.7rem] border border-dashed border-[#b9aea0] bg-white/80 px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-[#b88a56]/20"
                    maxLength={3}
                    onChange={(event) => updateField('manualBudgetCurrency', event.target.value)}
                    value={formState.manualBudgetCurrency}
                  />
                </div>
              ) : null}
            </fieldset>

            <fieldset className="rounded-[0.9rem] border border-[#d8c5a7] bg-white/58 p-4">
              <legend className="flex items-center gap-2 px-1 font-hand text-[1.4rem] font-bold text-[#251b15]">
                <Eye className="h-4 w-4" />
                {t('trips.fields.visibility')}
              </legend>
              <div className="mt-3 grid gap-2">
                {(['private', 'public'] as const).map((visibility) => (
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#4d4037]" key={visibility}>
                    <input
                      checked={formState.visibility === visibility}
                      onChange={() => updateField('visibility', visibility)}
                      type="radio"
                    />
                    {t(`trips.visibility.${visibility}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {submitError ? (
            <p className="mt-5 rounded-[0.9rem] border border-[#f1a69b] bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[#b42318]" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="mt-7 flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#315c42] bg-[#b9e177] px-6 py-3 font-bold text-[#172612] shadow-[0_8px_0_#6f9e44] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t('trips.actions.creating') : t('trips.actions.create')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <aside className="rounded-[1rem] border border-[#d8c5a7] bg-[#fffdf7] p-5 shadow-[0_18px_32px_rgba(92,66,43,0.12)]">
          <div className="overflow-hidden rounded-[0.85rem] bg-[#efe2ca]">
            {formState.coverImageUrl ? (
              <img
                alt=""
                className="h-52 w-full object-cover"
                src={formState.coverImageUrl}
              />
            ) : (
              <div className="flex h-52 items-center justify-center bg-[#f3e2c4] text-[#8d7f72]">
                <CalendarDays className="h-12 w-12" />
              </div>
            )}
          </div>
          <p className="mt-5 font-hand text-[1.45rem] font-bold leading-none text-[#9a5c41]">
            {t('trips.overviewEyebrow')}
          </p>
          <h2 className="mt-2 font-display text-[1.9rem] leading-tight text-[#261b15]">
            {previewTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#66594d]">
            {formState.summaryNotes || t('trips.overviewDescription')}
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="rounded-[0.8rem] bg-[#f8edda] px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#8d7f72]">
                {t('trips.fields.dateRange')}
              </dt>
              <dd className="mt-1 font-marker text-[1.15rem] text-[#2f241e]">
                {dateRangePreview}
              </dd>
            </div>
            <div className="rounded-[0.8rem] bg-[#f8edda] px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#8d7f72]">
                {t('trips.fields.visibility')}
              </dt>
              <dd className="mt-1 font-marker text-[1.15rem] text-[#2f241e]">
                {t(`trips.visibility.${formState.visibility}`)}
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </PublicPageShell>
  );
}
