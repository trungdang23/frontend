import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Compass, LogIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import {
  getPublicTripDetail,
  getPublicTripPlanner,
} from '@/features/trips/public/api/public-trip-api';
import { publicTripQueryKeys } from '@/features/trips/public/lib/public-trip-query-keys';
import { PublicTripPlanner } from '@/features/trips/public/components/public-trip-planner';
import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import {
  formatTripConfiguredBudget,
  formatTripDateRange,
  getTripBudgetModeLabel,
  getTripVisibilityLabel,
} from '@/features/trips/lib/trip-presenters';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageSection } from '@/shared/ui/page-section';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';
import { SiteHeader } from '@/shared/ui/site-header';
import { StatusBanner } from '@/shared/ui/status-banner';

export function PublicTripPage() {
  const { tripId } = useParams();
  const { language, t } = useI18n();

  const tripQuery = useQuery({
    queryKey: publicTripQueryKeys.detail(tripId as string),
    queryFn: ({ signal }) => getPublicTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
    staleTime: 30_000,
  });
  const plannerQuery = useQuery({
    queryKey: publicTripQueryKeys.planner(tripId as string),
    queryFn: ({ signal }) => getPublicTripPlanner(tripId as string, { signal }),
    enabled: Boolean(tripId) && tripQuery.status === 'success',
    staleTime: 0,
  });

  if (!tripId || tripQuery.isPending) {
    return <PublicPageSkeleton variant="trip" />;
  }

  if (
    tripQuery.isError &&
    tripQuery.error instanceof ApiError &&
    tripQuery.error.status === 404
  ) {
    return (
      <PublicTripShell>
        <EmptyState
          action={
            <Link className={getButtonClasses()} to="/">
              {t('trips.publicPage.actions.backHome')}
            </Link>
          }
          description={t('trips.publicPage.notFoundDescription')}
          eyebrow={t('trips.publicPage.eyebrow')}
          title={t('trips.publicPage.notFoundTitle')}
        />
      </PublicTripShell>
    );
  }

  if (
    tripQuery.isError &&
    tripQuery.error instanceof ApiError &&
    tripQuery.error.status === 403
  ) {
    return (
      <PublicTripShell>
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Link className={getButtonClasses()} to="/auth/login">
                {t('trips.publicPage.actions.login')}
              </Link>
              <Link className={getButtonClasses('secondary')} to="/">
                {t('trips.publicPage.actions.backHome')}
              </Link>
            </div>
          }
          description={t('trips.publicPage.privateDescription')}
          eyebrow={t('trips.publicPage.eyebrow')}
          title={t('trips.publicPage.privateTitle')}
        />
      </PublicTripShell>
    );
  }

  if (tripQuery.isError) {
    return (
      <PublicTripShell>
        <EmptyState
          action={
            <button
              className={getButtonClasses()}
              onClick={() => void tripQuery.refetch()}
              type="button"
            >
              {t('trips.actions.retry')}
            </button>
          }
          description={
            tripQuery.error instanceof ApiError && tripQuery.error.message
              ? tripQuery.error.message
              : t('trips.publicPage.loadErrorDescription')
          }
          eyebrow={t('trips.publicPage.eyebrow')}
          title={t('trips.publicPage.loadErrorTitle')}
        />
      </PublicTripShell>
    );
  }

  const trip = tripQuery.data;

  if (!trip) {
    return null;
  }

  const plannerNodes = plannerQuery.data?.nodes ?? [];
  const rootNodeCount = plannerNodes.filter((node) => node.parentId === null).length;
  const childNodeCount = plannerNodes.length - rootNodeCount;
  const defaultCurrency =
    trip.manualBudgetCurrency ?? trip.budgetCurrency ?? 'VND';

  return (
    <PublicTripShell>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-forest)]"
                to="/"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('trips.publicPage.actions.backHome')}
              </Link>

              <div className="space-y-3">
                <p className="eyebrow-text text-[var(--color-forest)]">
                  {t('trips.publicPage.eyebrow')}
                </p>
                <h1 className="headline text-4xl text-[var(--color-ink)]">
                  {trip.name}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                  {trip.summaryNotes ?? t('trips.notesEmpty')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[rgba(84,107,65,0.12)] px-4 py-2 text-sm font-semibold text-[var(--color-forest)]">
                  {getTripVisibilityLabel(trip.visibility, t)}
                </span>
                <span className="rounded-full bg-[rgba(138,103,61,0.12)] px-4 py-2 text-sm font-semibold text-[var(--color-earth)]">
                  {getTripBudgetModeLabel(trip.budgetMode, t)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <OverviewMetric
                  label={t('trips.fields.dateRange')}
                  value={formatTripDateRange(
                    trip.startDate,
                    trip.endDate,
                    language,
                  )}
                />
                <OverviewMetric
                  label={t('trips.fields.budget')}
                  value={formatTripConfiguredBudget(trip, language, t)}
                />
                <OverviewMetric
                  label={t('trips.publicPage.metrics.plannerDensity')}
                  value={t('trips.planner.metrics.totalNodesValue', {
                    children: childNodeCount,
                    roots: rootNodeCount,
                  })}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className={getButtonClasses()} to="/auth/register">
                  <span className="inline-flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    {t('trips.publicPage.actions.startPlanning')}
                  </span>
                </Link>
                <Link className={getButtonClasses('secondary')} to="/auth/login">
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('trips.publicPage.actions.login')}
                  </span>
                </Link>
              </div>
            </div>

            <TripCoverImage
              alt={trip.name}
              className="h-full min-h-80 rounded-[2rem]"
              src={trip.coverImageUrl}
            />
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">
              {t('trips.publicPage.plannerEyebrow')}
            </p>
            <h2 className="headline text-3xl text-[var(--color-ink)]">
              {t('trips.publicPage.plannerTitle')}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('trips.publicPage.plannerDescription')}
            </p>
          </div>

          {plannerQuery.isSuccess ? (
            <StatusBanner>
              {t('trips.publicPage.readOnlyNotice')}
            </StatusBanner>
          ) : null}

          <PublicTripPlanner
            defaultCurrency={defaultCurrency}
            error={plannerQuery.error}
            isLoading={plannerQuery.isPending}
            nodes={plannerNodes}
            onRetry={() => plannerQuery.refetch()}
          />
        </Card>
      </div>
    </PublicTripShell>
  );
}

function PublicTripShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <PageSection className="pt-12">{children}</PageSection>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-5">
      <p className="eyebrow-text-xs text-[var(--color-forest)]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}
