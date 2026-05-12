import {
  type FormEvent,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buildPlannerTripPath } from '@/app/router/trip-route-redirects';
import { getTripDetail, createTrip, updateTrip } from '@/features/trips/api/trips-api';
import { journalQueryKeys } from '@/features/journal/lib/journal-query-keys';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import {
  buildTripFormDraftFromTrip,
  buildTripUpsertPayload,
  createDefaultTripFormDraft,
  isValidHttpUrl,
  type TripFormChangeHandler,
  type TripFormDraft,
  type TripFormDraftErrors,
  validateTripFormDraft,
} from '@/features/trips/lib/trip-form';
import { plannerQueryKeys } from '@/features/trips/planning/lib/planner-query-keys';
import { publicTripQueryKeys } from '@/features/trips/public/lib/public-trip-query-keys';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';

type TripFormPageFeedback = {
  kind: 'error' | 'success';
  message: string;
};

export function TripFormPage() {
  const { tripId: routeTripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const tripId = routeTripId?.trim() ?? '';
  const isEditMode = Boolean(tripId);
  const [draft, setDraft] = useState<TripFormDraft>(createDefaultTripFormDraft);
  const [errors, setErrors] = useState<TripFormDraftErrors>({});
  const [feedback, setFeedback] = useState<TripFormPageFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hydratedTripIdRef = useRef<string | null>(null);
  const tripDetailQueryKey = ['trips', 'detail', tripId] as const;
  const tripQuery = useQuery({
    enabled: isEditMode,
    queryFn: ({ signal }) => getTripDetail(tripId, { signal }),
    queryKey: tripDetailQueryKey,
  });
  const errorStatus = tripQuery.error instanceof ApiError ? tripQuery.error.status : null;
  const coverImageUrl = draft.coverImageUrl.trim();
  const shouldShowCoverImage = Boolean(coverImageUrl) && isValidHttpUrl(coverImageUrl);
  const pageEyebrow = t(isEditMode ? 'trips.editEyebrow' : 'trips.createEyebrow');
  const pageTitle = t(isEditMode ? 'trips.editTitle' : 'trips.createTitle');
  const submitLabel = isSubmitting
    ? t(isEditMode ? 'trips.actions.saving' : 'trips.actions.creating')
    : t(isEditMode ? 'trips.actions.save' : 'trips.actions.create');

  useEffect(() => {
    if (tripQuery.data && hydratedTripIdRef.current !== tripQuery.data.id) {
      setDraft(buildTripFormDraftFromTrip(tripQuery.data));
      setErrors({});
      setFeedback(null);
      hydratedTripIdRef.current = tripQuery.data.id;
    }
  }, [tripQuery.data]);

  useEffect(() => {
    if (!isEditMode) {
      hydratedTripIdRef.current = null;
      setDraft(createDefaultTripFormDraft());
      setErrors({});
      setFeedback(null);
    }
  }, [isEditMode]);

  const updateDraft: TripFormChangeHandler = (field, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
    setFeedback(null);
    setErrors((currentErrors) => {
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

  const invalidateTripCaches = async (targetTripId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['trips', 'list'] }),
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', targetTripId] }),
      queryClient.invalidateQueries({ queryKey: plannerQueryKeys.detail(targetTripId) }),
      queryClient.invalidateQueries({ queryKey: journalQueryKeys.detail(targetTripId) }),
      queryClient.invalidateQueries({ queryKey: journalQueryKeys.mine() }),
      queryClient.invalidateQueries({ queryKey: journalQueryKeys.publicList() }),
      queryClient.invalidateQueries({ queryKey: journalQueryKeys.publicDetail(targetTripId) }),
      queryClient.invalidateQueries({ queryKey: publicTripQueryKeys.planner(targetTripId) }),
      queryClient.invalidateQueries({ queryKey: ['public', 'trips'] }),
    ]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || (isEditMode && !tripQuery.data)) {
      return;
    }

    const nextErrors = validateTripFormDraft(draft, t);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildTripUpsertPayload(draft);
      const savedTrip = isEditMode ? await updateTrip(tripId, payload) : await createTrip(payload);

      queryClient.setQueryData(['trips', 'detail', savedTrip.id], savedTrip);
      await invalidateTripCaches(savedTrip.id);

      if (!isEditMode) {
        navigate(buildPlannerTripPath(savedTrip.id), { replace: true });
        return;
      }

      hydratedTripIdRef.current = savedTrip.id;
      setDraft(buildTripFormDraftFromTrip(savedTrip));
      setFeedback({
        kind: 'success',
        message: t('trips.feedback.updateSuccess'),
      });
    } catch {
      setFeedback({
        kind: 'error',
        message: t(isEditMode ? 'trips.feedback.updateError' : 'trips.feedback.createError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && tripQuery.isLoading && !tripQuery.data) {
    return (
      <PublicPageShell
        mainClassName={publicPageMainLayouts.community}
        mainId="trip-form-content"
        scrollable
      >
        <TripFormState
          action={(
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-4 py-2 font-marker font-bold leading-none text-[#6b4938] shadow-[0_5px_0_rgba(139,98,68,0.18)] transition hover:-translate-y-0.5"
              to="/app/trips"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.backToList')}
            </Link>
          )}
          description={t('trips.loadingDescription')}
          eyebrow={pageEyebrow}
          title={t('trips.loadingTitle')}
        />
      </PublicPageShell>
    );
  }

  if (isEditMode && tripQuery.isError) {
    return (
      <PublicPageShell
        mainClassName={publicPageMainLayouts.community}
        mainId="trip-form-content"
        scrollable
      >
        <TripFormState
          action={(
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-4 py-2 font-marker font-bold leading-none text-[#6b4938] shadow-[0_5px_0_rgba(139,98,68,0.18)] transition hover:-translate-y-0.5"
              to="/app/trips"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.backToList')}
            </Link>
          )}
          title={t(errorStatus === 404 ? 'trips.notFoundTitle' : 'trips.loadErrorTitle')}
        />
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.community}
      mainId="trip-form-content"
      scrollable
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-5 lg:py-7">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-4 py-2 font-marker font-bold leading-none text-[#6b4938] shadow-[0_4px_0_rgba(139,98,68,0.15)] transition hover:-translate-y-0.5"
            to="/app/trips"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.actions.backToList')}
          </Link>
          {isEditMode ? (
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_4px_0_#6f9e44] transition hover:-translate-y-0.5"
              to={buildPlannerTripPath(tripId)}
            >
              {t('trips.actions.openPlanner')}
              <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
            </Link>
          ) : null}
        </div>

        {feedback ? (
          <p
            className={cn(
              'rounded-[0.95rem] border px-4 py-3 font-marker text-[1rem] leading-tight shadow-[0_10px_18px_rgba(76,51,33,0.08)]',
              feedback.kind === 'success'
                ? 'border-[#6f9e44]/35 bg-[#f1ffd8] text-[#31521c]'
                : 'border-[#d92d20]/25 bg-[#fff1f0] text-[#b42318]',
            )}
            role={feedback.kind === 'success' ? 'status' : 'alert'}
          >
            {feedback.message}
          </p>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
            <section className="rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] p-5 shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TripFormInput
                  error={errors.name}
                  id="trip-name"
                  label={t('trips.fields.name')}
                  onChange={(value) => updateDraft('name', value)}
                  required
                  value={draft.name}
                />
                <TripFormInput
                  error={errors.destination}
                  id="trip-destination"
                  label={t('trips.fields.destination')}
                  onChange={(value) => updateDraft('destination', value)}
                  value={draft.destination}
                />
                <TripFormInput
                  error={errors.startDate}
                  id="trip-start-date"
                  label={t('trips.fields.startDate')}
                  onChange={(value) => updateDraft('startDate', value)}
                  required
                  type="date"
                  value={draft.startDate}
                />
                <TripFormInput
                  error={errors.endDate}
                  id="trip-end-date"
                  label={t('trips.fields.endDate')}
                  onChange={(value) => updateDraft('endDate', value)}
                  required
                  type="date"
                  value={draft.endDate}
                />
              </div>
            </section>

            <section className="rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] p-5 shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:p-6">
              <div className="grid gap-4">
                <TripFormInput
                  error={errors.coverImageUrl}
                  id="trip-cover-image"
                  label={t('trips.fields.coverImageUrl')}
                  onChange={(value) => updateDraft('coverImageUrl', value)}
                  placeholder={t('trips.placeholders.coverImageUrl')}
                  type="url"
                  value={draft.coverImageUrl}
                />
                {shouldShowCoverImage ? (
                  <img
                    alt=""
                    className="h-40 w-full rounded-[0.85rem] object-cover"
                    src={coverImageUrl}
                  />
                ) : null}
                <TripFormTextarea
                  error={errors.summaryNotes}
                  id="trip-summary-notes"
                  label={t('trips.fields.summaryNotes')}
                  onChange={(value) => updateDraft('summaryNotes', value)}
                  placeholder={t('trips.placeholders.summaryNotes')}
                  value={draft.summaryNotes}
                />
              </div>
            </section>

            <section className="rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] p-5 shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:p-6">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-marker text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#6b4938]">
                    {t('trips.fields.budgetMode')}
                  </span>
                  <div className="flex rounded-full border border-[#d8c5ab] bg-[#faf6ef] p-0.5">
                    <button
                      className={cn(
                        'rounded-full px-4 py-1.5 font-marker text-[0.92rem] font-bold leading-none transition',
                        draft.budgetMode === 'auto'
                          ? 'bg-[#b9e177] text-[#172612] shadow-[0_2px_0_#6f9e44]'
                          : 'text-[#6b4938] hover:text-[#3d2b22]',
                      )}
                      onClick={() => updateDraft('budgetMode', 'auto')}
                      type="button"
                    >
                      {t('trips.budget.modeAuto')}
                    </button>
                    <button
                      className={cn(
                        'rounded-full px-4 py-1.5 font-marker text-[0.92rem] font-bold leading-none transition',
                        draft.budgetMode === 'manual'
                          ? 'bg-[#b9e177] text-[#172612] shadow-[0_2px_0_#6f9e44]'
                          : 'text-[#6b4938] hover:text-[#3d2b22]',
                      )}
                      onClick={() => updateDraft('budgetMode', 'manual')}
                      type="button"
                    >
                      {t('trips.budget.modeManual')}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-marker text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#6b4938]">
                    {t('trips.fields.visibility')}
                  </span>
                  <div className="flex rounded-full border border-[#d8c5ab] bg-[#faf6ef] p-0.5">
                    <button
                      className={cn(
                        'rounded-full px-4 py-1.5 font-marker text-[0.92rem] font-bold leading-none transition',
                        draft.visibility === 'private'
                          ? 'bg-[#fff1d9] text-[#6b4938] shadow-[0_2px_0_rgba(139,98,68,0.25)]'
                          : 'text-[#6b4938] hover:text-[#3d2b22]',
                      )}
                      onClick={() => updateDraft('visibility', 'private')}
                      type="button"
                    >
                      {t('trips.visibility.private')}
                    </button>
                    <button
                      className={cn(
                        'rounded-full px-4 py-1.5 font-marker text-[0.92rem] font-bold leading-none transition',
                        draft.visibility === 'public'
                          ? 'bg-[#b9e177] text-[#172612] shadow-[0_2px_0_#6f9e44]'
                          : 'text-[#6b4938] hover:text-[#3d2b22]',
                      )}
                      onClick={() => updateDraft('visibility', 'public')}
                      type="button"
                    >
                      {t('trips.visibility.public')}
                    </button>
                  </div>
                </div>
              </div>

              {draft.budgetMode === 'manual' && (
                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                  <TripFormInput
                    error={errors.manualBudgetAmount}
                    id="trip-manual-budget-amount"
                    inputMode="decimal"
                    label={t('trips.fields.manualBudgetAmount')}
                    min="0"
                    onChange={(value) => updateDraft('manualBudgetAmount', value)}
                    step="0.01"
                    type="number"
                    value={draft.manualBudgetAmount}
                  />
                  <TripFormInput
                    error={errors.manualBudgetCurrency}
                    id="trip-manual-budget-currency"
                    label={t('trips.fields.manualBudgetCurrency')}
                    maxLength={3}
                    onChange={(value) => updateDraft('manualBudgetCurrency', value.toUpperCase())}
                    placeholder={t('trips.placeholders.manualBudgetCurrency')}
                    value={draft.manualBudgetCurrency}
                  />
                </div>
              )}
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-5 py-3 font-marker font-bold leading-none text-[#172612] shadow-[0_6px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isEditMode ? <Pencil className="h-4 w-4" strokeWidth={2.4} /> : <ArrowRight className="h-4 w-4" strokeWidth={2.4} />}
                {submitLabel}
              </button>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-5 py-3 font-marker font-bold leading-none text-[#6b4938] shadow-[0_6px_0_rgba(139,98,68,0.18)] transition hover:-translate-y-0.5"
                to="/app/trips"
              >
                {t('trips.actions.cancel')}
              </Link>
            </div>
        </form>
      </div>
    </PublicPageShell>
  );
}

function TripFormState({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] px-5 py-14 text-center shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:px-8">
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h1 className="mt-2 font-display text-[2.2rem] leading-tight text-[#2c1f18] sm:text-[2.8rem]">
        {title}
      </h1>
      {description ? (
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
        {description}
      </p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </section>
  );
}

function TripFormInput({
  error,
  id,
  inputMode,
  label,
  maxLength,
  min,
  onChange,
  placeholder,
  required,
  step,
  type = 'text',
  value,
}: {
  error?: string;
  id: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  label: string;
  maxLength?: number;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="font-marker text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#6b4938]">
        {label}
      </span>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'rounded-[0.85rem] border bg-white/90 px-4 py-3 text-base text-[#251913] outline-none transition focus:ring-2 focus:ring-[#8b6244]/15',
          error ? 'border-[#d92d20]' : 'border-[#d8c5ab] focus:border-[#8b6244]',
        )}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        step={step}
        type={type}
        value={value}
      />
      <TripFormFieldError id={errorId} message={error} />
    </label>
  );
}

function TripFormTextarea({
  error,
  id,
  label,
  onChange,
  placeholder,
  value,
}: {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="font-marker text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#6b4938]">
        {label}
      </span>
      <textarea
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-36 rounded-[0.85rem] border bg-white/90 px-4 py-3 text-base leading-7 text-[#251913] outline-none transition focus:ring-2 focus:ring-[#8b6244]/15',
          error ? 'border-[#d92d20]' : 'border-[#d8c5ab] focus:border-[#8b6244]',
        )}
        id={id}
        maxLength={2000}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      <TripFormFieldError id={errorId} message={error} />
    </label>
  );
}

function TripFormFieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm leading-6 text-[#b42318]" id={id} role="alert">
      {message}
    </p>
  );
}
