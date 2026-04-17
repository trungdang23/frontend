import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import { TripFormValues, createTripFormSchema, mapTripFormValuesToPayload } from '@/features/trips/lib/trip-form-validators';
import { TripUpsertPayload } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { StatusBanner } from '@/shared/ui/status-banner';
import { Textarea } from '@/shared/ui/textarea';

type TripFormProps = {
  cancelTo: string;
  initialValues: TripFormValues;
  mode: 'create' | 'edit';
  onSubmit: (payload: TripUpsertPayload) => Promise<void>;
  submitError?: string | null;
};

export function TripForm({
  cancelTo,
  initialValues,
  mode,
  onSubmit,
  submitError,
}: TripFormProps) {
  const { t } = useI18n();
  const schema = createTripFormSchema(t);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<TripFormValues>({
    defaultValues: initialValues,
  });

  const previewName = useWatch({ control, name: 'name' })?.trim() ?? '';
  const previewDestination =
    useWatch({ control, name: 'destination' })?.trim() ?? '';
  const previewCoverImageUrl = useWatch({ control, name: 'coverImageUrl' }) ?? '';

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          field === 'name' ||
          field === 'destination' ||
          field === 'summaryNotes' ||
          field === 'coverImageUrl' ||
          field === 'startDate' ||
          field === 'endDate' ||
          field === 'timezone' ||
          field === 'budgetAmount' ||
          field === 'budgetCurrency'
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    await onSubmit(mapTripFormValuesToPayload(parsed.data));
  });

  return (
    <form className="space-y-6" onSubmit={submitHandler}>
      {submitError ? <StatusBanner tone="danger">{submitError}</StatusBanner> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-name">
            {t('trips.fields.name')}
          </label>
          <Input
            hasError={Boolean(errors.name)}
            id="trip-name"
            type="text"
            {...register('name')}
          />
          {errors.name ? <p className="text-sm text-[var(--color-danger)]">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-destination">
            {t('trips.fields.destination')}
          </label>
          <Input
            hasError={Boolean(errors.destination)}
            id="trip-destination"
            placeholder={t('trips.placeholders.destination')}
            type="text"
            {...register('destination')}
          />
          {errors.destination ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.destination.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-cover-image-url">
            {t('trips.fields.coverImageUrl')}
          </label>
          <Input
            hasError={Boolean(errors.coverImageUrl)}
            id="trip-cover-image-url"
            placeholder={t('trips.placeholders.coverImageUrl')}
            type="url"
            {...register('coverImageUrl')}
          />
          {errors.coverImageUrl ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.coverImageUrl.message}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)]">
            <div className="relative h-52">
              <TripCoverImage
                alt={previewName || t('trips.preview.coverAltFallback')}
                className="absolute inset-0"
                imgClassName="h-full w-full object-cover"
                src={previewCoverImageUrl}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.1),rgba(12,24,18,0.75))]" />
              <div className="relative flex h-full items-end p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="eyebrow-text-xs text-white/75">
                    {previewDestination || t('trips.preview.destinationFallback')}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {previewName || t('trips.preview.titleFallback')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-start-date">
            {t('trips.fields.startDate')}
          </label>
          <Input
            hasError={Boolean(errors.startDate)}
            id="trip-start-date"
            type="date"
            {...register('startDate')}
          />
          {errors.startDate ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.startDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-end-date">
            {t('trips.fields.endDate')}
          </label>
          <Input
            hasError={Boolean(errors.endDate)}
            id="trip-end-date"
            type="date"
            {...register('endDate')}
          />
          {errors.endDate ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.endDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-timezone">
            {t('trips.fields.timezone')}
          </label>
          <Input
            hasError={Boolean(errors.timezone)}
            id="trip-timezone"
            placeholder={t('trips.placeholders.timezone')}
            type="text"
            {...register('timezone')}
          />
          {errors.timezone ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.timezone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-budget-amount">
            {t('trips.fields.budgetAmount')}
          </label>
          <Input
            hasError={Boolean(errors.budgetAmount)}
            id="trip-budget-amount"
            min="0"
            step="1000"
            type="number"
            {...register('budgetAmount')}
          />
          {errors.budgetAmount ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.budgetAmount.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-budget-currency">
            {t('trips.fields.budgetCurrency')}
          </label>
          <Input
            autoCapitalize="characters"
            className="uppercase"
            hasError={Boolean(errors.budgetCurrency)}
            id="trip-budget-currency"
            maxLength={3}
            placeholder={t('trips.placeholders.budgetCurrency')}
            type="text"
            {...register('budgetCurrency')}
          />
          {errors.budgetCurrency ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.budgetCurrency.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="trip-summary-notes">
            {t('trips.fields.summaryNotes')}
          </label>
          <Textarea
            hasError={Boolean(errors.summaryNotes)}
            id="trip-summary-notes"
            placeholder={t('trips.placeholders.summaryNotes')}
            rows={5}
            {...register('summaryNotes')}
          />
          {errors.summaryNotes ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.summaryNotes.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">
          {isSubmitting
            ? mode === 'create'
              ? t('trips.actions.creating')
              : t('trips.actions.saving')
            : mode === 'create'
              ? t('trips.actions.create')
              : t('trips.actions.save')}
        </Button>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-forest)]"
          to={cancelTo}
        >
          {t('trips.actions.cancel')}
        </Link>
      </div>
    </form>
  );
}
