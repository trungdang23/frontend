import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';

import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import {
  createCommunityPostFormSchema,
  mapCommunityPostFormValuesToPayload,
  type CommunityPostFormValues,
} from '@/features/community/lib/community-post-form-validators';
import type { CommunityPostCreatePayload } from '@/features/community/types/post';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { StatusBanner } from '@/shared/ui/status-banner';
import { Textarea } from '@/shared/ui/textarea';

export type LinkedTripOption = {
  id: string;
  name: string;
  coverImageUrl: string | null;
};

type CommunityPostFormProps = {
  cancelTo: string;
  initialValues: CommunityPostFormValues;
  linkedTripOptions: LinkedTripOption[];
  onSubmit: (payload: CommunityPostCreatePayload) => Promise<void>;
  submitError?: string | null;
};

function getDescribedBy(...ids: Array<string | undefined>) {
  const describedBy = ids.filter(Boolean).join(' ');

  return describedBy.length > 0 ? describedBy : undefined;
}

export function CommunityPostForm({
  cancelTo,
  initialValues,
  linkedTripOptions,
  onSubmit,
  submitError,
}: CommunityPostFormProps) {
  const { t } = useI18n();
  const schema = createCommunityPostFormSchema(t);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CommunityPostFormValues>({
    defaultValues: initialValues,
  });

  const previewTitle = useWatch({ control, name: 'title' })?.trim() ?? '';
  const previewCoverImageUrl =
    useWatch({ control, name: 'coverImageUrl' })?.trim() ?? '';
  const linkedTripId = useWatch({ control, name: 'tripId' })?.trim() ?? '';
  const linkedTrip =
    linkedTripOptions.find((option) => option.id === linkedTripId) ?? null;
  const resolvedPreviewCoverImageUrl =
    previewCoverImageUrl || linkedTrip?.coverImageUrl || null;
  const fieldErrorIds = {
    title: 'community-title-error',
    coverImageUrl: 'community-cover-image-url-error',
    tripId: 'community-trip-id-error',
    content: 'community-content-error',
  } as const;
  const tripHelperId = 'community-trip-id-helper';

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          field === 'title' ||
          field === 'content' ||
          field === 'coverImageUrl' ||
          field === 'tripId'
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    await onSubmit(mapCommunityPostFormValuesToPayload(parsed.data));
  });

  return (
    <form className="space-y-6" onSubmit={submitHandler}>
      {submitError ? (
        <StatusBanner tone="danger">{submitError}</StatusBanner>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="community-title"
          >
            {t('community.fields.title')}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.title ? fieldErrorIds.title : undefined,
            )}
            hasError={Boolean(errors.title)}
            id="community-title"
            type="text"
            {...register('title')}
          />
          {errors.title ? (
            <p className="text-sm text-[var(--color-danger)]" id={fieldErrorIds.title}>
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="community-cover-image-url"
          >
            {t('community.fields.coverImageUrl')}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.coverImageUrl ? fieldErrorIds.coverImageUrl : undefined,
            )}
            hasError={Boolean(errors.coverImageUrl)}
            id="community-cover-image-url"
            placeholder={t('community.placeholders.coverImageUrl')}
            type="url"
            {...register('coverImageUrl')}
          />
          {errors.coverImageUrl ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.coverImageUrl}
            >
              {errors.coverImageUrl.message}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)]">
            <div className="relative h-52">
              <TripCoverImage
                alt={previewTitle || t('community.preview.titleFallback')}
                className="absolute inset-0"
                imgClassName="h-full w-full object-cover"
                src={resolvedPreviewCoverImageUrl}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.1),rgba(12,24,18,0.75))]" />
              <div className="relative flex h-full items-end p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/74">
                    {linkedTrip
                      ? t('community.preview.linkedTripActive')
                      : t('community.preview.linkedTripInactive')}
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {previewTitle || t('community.preview.titleFallback')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="community-trip-id"
          >
            {t('community.fields.linkedTrip')}
          </label>
          <select
            aria-describedby={getDescribedBy(
              tripHelperId,
              errors.tripId ? fieldErrorIds.tripId : undefined,
            )}
            aria-invalid={Boolean(errors.tripId)}
            className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none transition focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]"
            id="community-trip-id"
            {...register('tripId')}
          >
            <option value="">{t('community.tripSelector.none')}</option>
            {linkedTripOptions.map((tripOption) => (
              <option key={tripOption.id} value={tripOption.id}>
                {tripOption.name}
              </option>
            ))}
          </select>
          {linkedTripOptions.length === 0 ? (
            <p
              className="text-sm leading-7 text-[var(--color-ink-soft)]"
              id={tripHelperId}
            >
              {t('community.tripSelector.empty')}
            </p>
          ) : (
            <p
              className="text-sm leading-7 text-[var(--color-ink-soft)]"
              id={tripHelperId}
            >
              {t('community.tripSelector.helper')}
            </p>
          )}
          {errors.tripId ? (
            <p className="text-sm text-[var(--color-danger)]" id={fieldErrorIds.tripId}>
              {errors.tripId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="community-content"
          >
            {t('community.fields.content')}
          </label>
          <Textarea
            aria-describedby={getDescribedBy(
              errors.content ? fieldErrorIds.content : undefined,
            )}
            hasError={Boolean(errors.content)}
            id="community-content"
            placeholder={t('community.placeholders.content')}
            rows={10}
            {...register('content')}
          />
          {errors.content ? (
            <p className="text-sm text-[var(--color-danger)]" id={fieldErrorIds.content}>
              {errors.content.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">
          {isSubmitting
            ? t('community.actions.publishing')
            : t('community.actions.create')}
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
