import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteTrip, getTripDetail } from '@/features/trips/api/trips-api';
import { TripDeleteButton } from '@/features/trips/components/trip-delete-button';
import { formatTripBudget, formatTripDateRange } from '@/features/trips/lib/trip-presenters';
import { useI18n } from '@/shared/i18n/use-i18n';
import { ApiError } from '@/shared/api/api-error';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusBanner } from '@/shared/ui/status-banner';

type TripRouteState = {
  noticeKey?: string;
};

export function TripDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { formatDate, language, t } = useI18n();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const noticeKey = (location.state as TripRouteState | null)?.noticeKey;
  const tripQuery = useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: ({ signal }) => getTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });

  async function handleDelete() {
    if (!tripId) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteTrip(tripId);
      navigate('/app/trips', {
        replace: true,
        state: { noticeKey: 'trips.feedback.deleteSuccess' },
      });
    } catch (error) {
      setDeleteError(
        error instanceof ApiError && error.message ? error.message : t('trips.feedback.deleteError'),
      );
      setIsDeleting(false);
    }
  }

  if (!tripId) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t('trips.actions.backToList')}
          </Link>
        }
        description={t('trips.notFoundDescription')}
        eyebrow={t('trips.detailEyebrow')}
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
        <Card className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
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
        eyebrow={t('trips.detailEyebrow')}
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
        eyebrow={t('trips.detailEyebrow')}
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">{t('trips.detailEyebrow')}</p>
            <div className="space-y-2">
              <h1 className="headline text-4xl text-[var(--color-ink)]">{trip.name}</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t('trips.detailDescription')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={getButtonClasses('secondary')} to="/app/trips">
              {t('trips.actions.backToList')}
            </Link>
            <Link className={getButtonClasses()} to={`/app/trips/${trip.id}/edit`}>
              {t('trips.actions.edit')}
            </Link>
          </div>
        </div>
        {noticeKey ? <StatusBanner tone="success">{t(noticeKey)}</StatusBanner> : null}
        {deleteError ? <StatusBanner tone="danger">{deleteError}</StatusBanner> : null}
      </Card>

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.destination')}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{trip.destination}</p>
        </div>

        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.dateRange')}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
            {formatTripDateRange(trip.startDate, trip.endDate, language)}
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.timezone')}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{trip.timezone}</p>
        </div>

        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.budget')}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
            {formatTripBudget(trip.budgetAmount, trip.budgetCurrency, language)}
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.createdAt')}</p>
          <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">{formatDate(trip.createdAt)}</p>
        </div>

        <div className="rounded-[1.5rem] bg-white/70 p-5">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.updatedAt')}</p>
          <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">{formatDate(trip.updatedAt)}</p>
        </div>
      </Card>

      <TripDeleteButton
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        tripName={trip.name}
      />
    </div>
  );
}
