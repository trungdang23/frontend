import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listTrips } from '@/features/trips/api/trips-api';
import { TripList } from '@/features/trips/components/trip-list';
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

export function TripsPage() {
  const location = useLocation();
  const { t } = useI18n();
  const noticeKey = (location.state as TripRouteState | null)?.noticeKey;
  const tripsQuery = useQuery({
    queryKey: ['trips', 'list'],
    queryFn: ({ signal }) => listTrips(undefined, { signal }),
  });

  if (tripsQuery.isPending) {
    return (
      <div className="space-y-5">
        <Card className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-2/3" />
        </Card>
      </div>
    );
  }

  if (tripsQuery.isError) {
    return (
      <EmptyState
        action={
          <button className={getButtonClasses()} onClick={() => void tripsQuery.refetch()} type="button">
            {t('trips.actions.retry')}
          </button>
        }
        description={
          tripsQuery.error instanceof ApiError && tripsQuery.error.message
            ? tripsQuery.error.message
            : t('trips.loadErrorDescription')
        }
        eyebrow={t('trips.listEyebrow')}
        title={t('trips.loadErrorTitle')}
      />
    );
  }

  if (!tripsQuery.data) {
    return null;
  }

  const { data, meta } = tripsQuery.data;

  if (data.length === 0) {
    return (
      <div className="space-y-5">
        {noticeKey ? <StatusBanner tone="success">{t(noticeKey)}</StatusBanner> : null}
        <EmptyState
          action={
            <Link className={getButtonClasses()} to="/app/trips/new">
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('trips.actions.create')}
              </span>
            </Link>
          }
          description={t('trips.emptyDescription')}
          eyebrow={t('trips.emptyEyebrow')}
          title={t('trips.emptyTitle')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">{t('trips.listEyebrow')}</p>
            <div className="space-y-2">
              <h1 className="headline text-3xl text-[var(--color-ink)] sm:text-4xl">{t('trips.listTitle')}</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t('trips.listDescription')}
              </p>
            </div>
          </div>
          <Link className={getButtonClasses()} to="/app/trips/new">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('trips.actions.create')}
            </span>
          </Link>
        </div>
        {noticeKey ? <StatusBanner tone="success">{t(noticeKey)}</StatusBanner> : null}
        <p className="text-sm text-[var(--color-ink-soft)]">
          {t('trips.listSummary', { count: meta.totalElements })}
        </p>
      </Card>

      <TripList trips={data} />
    </div>
  );
}
