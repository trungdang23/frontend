import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { listPublicTrips } from '@/features/trips/public/api/public-trip-api';
import { publicTripQueryKeys } from '@/features/trips/public/lib/public-trip-query-keys';
import { PublicTripList } from '@/features/trips/public/components/public-trip-list';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { PageSection } from '@/shared/ui/page-section';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';
import { SiteHeader } from '@/shared/ui/site-header';

export function PublicTripsPage() {
  const { t } = useI18n();
  const tripsQuery = useQuery({
    queryKey: publicTripQueryKeys.list,
    queryFn: ({ signal }) => listPublicTrips(undefined, { signal }),
    staleTime: 30_000,
  });

  if (tripsQuery.isPending) {
    return <PublicPageSkeleton variant="trip" />;
  }

  if (tripsQuery.isError) {
    return (
      <PublicTripsShell>
        <EmptyState
          action={
            <button
              className={getButtonClasses()}
              onClick={() => void tripsQuery.refetch()}
              type="button"
            >
              {t('trips.actions.retry')}
            </button>
          }
          description={
            tripsQuery.error instanceof ApiError && tripsQuery.error.message
              ? tripsQuery.error.message
              : t('trips.publicList.loadErrorDescription')
          }
          eyebrow={t('trips.publicList.eyebrow')}
          title={t('trips.publicList.loadErrorTitle')}
        />
      </PublicTripsShell>
    );
  }

  if (!tripsQuery.data) {
    return null;
  }

  const { data, meta } = tripsQuery.data;

  if (data.length === 0) {
    return (
      <PublicTripsShell>
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Link className={getButtonClasses()} to="/auth/register">
                {t('trips.publicList.actions.startPlanning')}
              </Link>
              <Link className={getButtonClasses('secondary')} to="/">
                {t('trips.publicList.actions.backHome')}
              </Link>
            </div>
          }
          description={t('trips.publicList.emptyDescription')}
          eyebrow={t('trips.publicList.eyebrow')}
          title={t('trips.publicList.emptyTitle')}
        />
      </PublicTripsShell>
    );
  }

  return (
    <PublicTripsShell>
      <div className="space-y-5">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">
              {t('trips.publicList.eyebrow')}
            </p>
            <div className="space-y-2">
              <h1 className="headline text-4xl text-[var(--color-ink)]">
                {t('trips.publicList.title')}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t('trips.publicList.description')}
              </p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {t('trips.publicList.summary', { count: meta.totalElements })}
          </p>
        </Card>

        <PublicTripList trips={data} />
      </div>
    </PublicTripsShell>
  );
}

function PublicTripsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <PageSection className="pt-12">{children}</PageSection>
    </div>
  );
}
