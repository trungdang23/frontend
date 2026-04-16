import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTripDetail, updateTrip } from '@/features/trips/api/trips-api';
import { TripForm } from '@/features/trips/components/trip-form';
import { getTripFormDefaults } from '@/features/trips/lib/trip-form-defaults';
import { TripUpsertPayload } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';
import { ApiError } from '@/shared/api/api-error';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Skeleton } from '@/shared/ui/skeleton';

export function TripEditPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tripQuery = useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: ({ signal }) => getTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });

  const initialValues = useMemo(
    () => (tripQuery.data ? getTripFormDefaults(tripQuery.data) : null),
    [tripQuery.data],
  );

  const handleUpdate = useCallback(
    async (payload: TripUpsertPayload) => {
      if (!tripId) {
        return;
      }

      setSubmitError(null);

      try {
        await updateTrip(tripId, payload);
        navigate(`/app/trips/${tripId}`, {
          replace: true,
          state: { noticeKey: 'trips.feedback.updateSuccess' },
        });
      } catch (error) {
        setSubmitError(
          error instanceof ApiError && error.message ? error.message : t('trips.feedback.updateError'),
        );
      }
    },
    [navigate, t, tripId],
  );

  if (!tripId) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t('trips.actions.backToList')}
          </Link>
        }
        description={t('trips.notFoundDescription')}
        eyebrow={t('trips.editEyebrow')}
        title={t('trips.notFoundTitle')}
      />
    );
  }

  if (tripQuery.isPending) {
    return (
      <div className="space-y-5">
        <Card className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>
    );
  }

  if (tripQuery.isError && tripQuery.error instanceof ApiError && tripQuery.error.status === 404) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t('trips.actions.backToList')}
          </Link>
        }
        description={t('trips.notFoundDescription')}
        eyebrow={t('trips.editEyebrow')}
        title={t('trips.notFoundTitle')}
      />
    );
  }

  if (tripQuery.isError) {
    return (
      <EmptyState
        action={
          <button className={getButtonClasses()} onClick={() => void tripQuery.refetch()} type="button">
            {t('trips.actions.retry')}
          </button>
        }
        description={
          tripQuery.error instanceof ApiError && tripQuery.error.message
            ? tripQuery.error.message
            : t('trips.loadErrorDescription')
        }
        eyebrow={t('trips.editEyebrow')}
        title={t('trips.loadErrorTitle')}
      />
    );
  }

  const trip = tripQuery.data;

  if (!trip) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <p className="eyebrow-text text-[var(--color-forest)]">{t('trips.editEyebrow')}</p>
        <div className="space-y-2">
          <h1 className="headline text-4xl text-[var(--color-ink)]">{t('trips.editTitle')}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('trips.editDescription')}
          </p>
        </div>
        <div>
          <Link className={getButtonClasses('secondary')} to={`/app/trips/${trip.id}`}>
            {t('trips.actions.viewDetails')}
          </Link>
        </div>
      </Card>

      <Card>
        {initialValues ? (
          <TripForm
            cancelTo={`/app/trips/${trip.id}`}
            initialValues={initialValues}
            mode="edit"
            onSubmit={handleUpdate}
            submitError={submitError}
          />
        ) : null}
      </Card>
    </div>
  );
}
