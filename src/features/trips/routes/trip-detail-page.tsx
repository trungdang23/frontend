import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { deleteTrip, getTripDetail } from '@/features/trips/api/trips-api';
import { getTripBudgetSummary } from '@/features/trips/api/trip-planning-api';
import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import { TripDeleteButton } from '@/features/trips/components/trip-delete-button';
import { TripShareCard } from '@/features/trips/components/trip-share-card';
import { PlannerWorkspace } from '@/features/trips/planning/components/planner-workspace';
import {
  createPlanNode,
  deletePlanNode,
  getTripPlanner,
  updatePlanNode,
} from '@/features/trips/planning/api/planner-api';
import { plannerQueryKeys } from '@/features/trips/planning/lib/planner-query-keys';
import {
  PlanNodeMutationPayload,
  PlanNodeUpdatePayload,
  PlannerNodeFormValues,
} from '@/features/trips/planning/types/plan-node';
import {
  formatTripBudgetBreakdown,
  formatTripConfiguredBudget,
  formatTripBudget,
  formatTripDateRange,
  getTripBudgetModeLabel,
  getTripVisibilityLabel,
} from '@/features/trips/lib/trip-presenters';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusBanner } from '@/shared/ui/status-banner';

type TripRouteState = {
  noticeKey?: string;
};

export function TripDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tripId } = useParams();
  const { language, t } = useI18n();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const noticeKey = (location.state as TripRouteState | null)?.noticeKey;

  const tripQuery = useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: ({ signal }) => getTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
    staleTime: 30_000,
  });
  const budgetSummaryQuery = useQuery({
    queryKey: ['trips', 'budget-summary', tripId],
    queryFn: ({ signal }) => getTripBudgetSummary(tripId as string, { signal }),
    enabled: Boolean(tripId),
    staleTime: 30_000,
  });
  const plannerQuery = useQuery({
    queryKey: plannerQueryKeys.detail(tripId as string),
    queryFn: ({ signal }) => getTripPlanner(tripId as string, { signal }),
    enabled: Boolean(tripId),
    staleTime: 0,
  });

  const createNodeMutation = useMutation({
    mutationFn: (payload: PlanNodeMutationPayload) => createPlanNode(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: plannerQueryKeys.detail(tripId as string),
      });
    },
  });
  const updateNodeMutation = useMutation({
    mutationFn: (payload: { nodeId: string; values: PlanNodeUpdatePayload }) =>
      updatePlanNode(payload.nodeId, payload.values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: plannerQueryKeys.detail(tripId as string),
      });
    },
  });
  const deleteNodeMutation = useMutation({
    mutationFn: (nodeId: string) => deletePlanNode(nodeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: plannerQueryKeys.detail(tripId as string),
      });
    },
  });

  async function handleDeleteTrip() {
    if (!tripId) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteTrip(tripId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'list'] }),
        queryClient.invalidateQueries({
          queryKey: ['trips', 'detail', tripId],
        }),
        queryClient.invalidateQueries({
          queryKey: plannerQueryKeys.detail(tripId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['trips', 'budget-summary', tripId],
        }),
      ]);
      navigate('/app/trips', {
        replace: true,
        state: { noticeKey: 'trips.feedback.deleteSuccess' },
      });
    } catch (error) {
      setDeleteError(
        error instanceof ApiError && error.message
          ? error.message
          : t('trips.feedback.deleteError'),
      );
    } finally {
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
    return <TripDetailSkeleton />;
  }

  if (
    tripQuery.isError &&
    tripQuery.error instanceof ApiError &&
    tripQuery.error.status === 404
  ) {
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

  const budgetSummary = budgetSummaryQuery.data;
  const plannerNodes = plannerQuery.data?.nodes ?? [];
  const rootNodeCount = plannerNodes.filter((node) => node.parentId === null).length;
  const childNodeCount = plannerNodes.length - rootNodeCount;
  const defaultCurrency =
    trip.manualBudgetCurrency ?? trip.budgetCurrency ?? 'VND';

  return (
    <div className="space-y-6">
      {noticeKey ? (
        <StatusBanner tone="success">{t(noticeKey)}</StatusBanner>
      ) : null}

      {deleteError ? <StatusBanner tone="danger">{deleteError}</StatusBanner> : null}

      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="eyebrow-text text-[var(--color-forest)]">
                {t('trips.detailEyebrow')}
              </p>
              <h1 className="headline text-4xl text-[var(--color-ink)]">
                {trip.name}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t('trips.detailDescription')}
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

            <div className="space-y-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/72 p-5">
              <div className="space-y-1">
                <p className="eyebrow-text-xs text-[var(--color-forest)]">
                  {t('trips.overviewEyebrow')}
                </p>
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
                  {t('trips.overviewTitle')}
                </h2>
              </div>
              <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                {trip.summaryNotes ?? t('trips.notesEmpty')}
              </p>
              <dl className="grid gap-4 sm:grid-cols-2">
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
              </dl>
            </div>

            <TripShareCard trip={trip} />

            <div className="flex flex-wrap gap-3">
              <Link
                className={getButtonClasses('secondary')}
                to="/app/trips"
              >
                {t('trips.actions.backToList')}
              </Link>
              <Link className={getButtonClasses()} to={`/app/trips/${trip.id}/edit`}>
                {t('trips.actions.edit')}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <TripCoverImage
              alt={trip.name}
              className="h-full min-h-80 rounded-[2rem]"
              src={trip.coverImageUrl}
            />
            <TripDeleteButton
              isDeleting={isDeleting}
              onConfirm={handleDeleteTrip}
              tripName={trip.name}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-text text-[var(--color-forest)]">
            {t('trips.planner.budgetEyebrow')}
          </p>
          <h2 className="headline text-3xl text-[var(--color-ink)]">
            {t('trips.planner.budgetTitle')}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('trips.planner.budgetDescription')}
          </p>
        </div>

        {budgetSummaryQuery.isError ? (
          <StatusBanner tone="danger">
            {budgetSummaryQuery.error instanceof ApiError &&
            budgetSummaryQuery.error.message
              ? budgetSummaryQuery.error.message
              : t('trips.planner.feedback.budgetLoadError')}
          </StatusBanner>
        ) : null}

        {budgetSummary?.hasMixedCurrencies ? (
          <StatusBanner tone="info">
            {t('trips.planner.feedback.mixedCurrencyInfo', {
              currency: budgetSummary.currency,
            })}
          </StatusBanner>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewMetric
            label={t('trips.planner.metrics.totalBudget')}
            value={formatTripConfiguredBudget(trip, language, t)}
          />
          <OverviewMetric
            label={t('trips.planner.metrics.plannedBudget')}
            value={
              budgetSummary
                ? formatTripBudget(
                    budgetSummary.totalPlannedAmount,
                    budgetSummary.currency,
                    language,
                  )
                : '...'
            }
          />
          <OverviewMetric
            label={t('trips.planner.metrics.remainingBudget')}
            value={
              budgetSummary
                ? formatTripBudget(
                    budgetSummary.remainingAmount,
                    budgetSummary.currency,
                    language,
                  )
                : '...'
            }
          />
          <OverviewMetric
            label={t('trips.planner.metrics.totalNodes')}
            value={t('trips.planner.metrics.totalNodesValue', {
              children: childNodeCount,
              roots: rootNodeCount,
            })}
          />
        </div>

        {budgetSummary?.hasMixedCurrencies ? (
          <div className="space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {t('trips.planner.metrics.currencyBreakdown')}
            </p>
            <ul className="grid gap-2 text-sm text-[var(--color-ink-soft)] sm:grid-cols-2">
              {formatTripBudgetBreakdown(budgetSummary, language).map((entry) => (
                <li
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                  key={entry}
                >
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card>
        <PlannerWorkspace
          defaultCurrency={defaultCurrency}
          error={plannerQuery.error}
          isLoading={plannerQuery.isPending}
          nodes={plannerNodes}
          onCreateChild={async (parent, values) => {
            await createNodeMutation.mutateAsync(
              buildCreateNodePayload(
                tripId,
                parent.id,
                plannerNodes.filter((node) => node.parentId === parent.id).length,
                values,
              ),
            );
          }}
          onCreateRoot={async (values) => {
            await createNodeMutation.mutateAsync(
              buildCreateNodePayload(
                tripId,
                null,
                rootNodeCount,
                values,
              ),
            );
          }}
          onDeleteNode={async (node) => {
            await deleteNodeMutation.mutateAsync(node.id);
          }}
          onRetry={() => plannerQuery.refetch()}
          onUpdateNode={async (node, values) => {
            await updateNodeMutation.mutateAsync({
              nodeId: node.id,
              values: buildUpdateNodePayload(values),
            });
          }}
        />
      </Card>
    </div>
  );
}

function buildCreateNodePayload(
  tripId: string,
  parentId: string | null,
  sortOrder: number,
  values: PlannerNodeFormValues,
): PlanNodeMutationPayload {
  return {
    tripId,
    parentId,
    type: values.type,
    title: values.title.trim(),
    notes: toOptionalString(values.notes),
    startAt: toOptionalString(values.startAt),
    endAt: toOptionalString(values.endAt),
    costAmount: toOptionalNumber(values.costAmount),
    costCurrency: toOptionalCurrency(values.costCurrency),
    imageUrl: toOptionalString(values.imageUrl),
    sortOrder,
  };
}

function buildUpdateNodePayload(values: PlannerNodeFormValues): PlanNodeUpdatePayload {
  return {
    type: values.type,
    title: values.title.trim(),
    notes: toOptionalString(values.notes),
    startAt: toOptionalString(values.startAt),
    endAt: toOptionalString(values.endAt),
    costAmount: toOptionalNumber(values.costAmount),
    costCurrency: toOptionalCurrency(values.costCurrency),
    imageUrl: toOptionalString(values.imageUrl),
  };
}

function toOptionalString(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function toOptionalCurrency(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue.toUpperCase() : null;
}

function toOptionalNumber(value: string): number | null {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  return Number(normalizedValue);
}

function OverviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
      <p className="eyebrow-text-xs text-[var(--color-forest)]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function TripDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-5 w-full max-w-3xl" />
        <Skeleton className="h-80 w-full rounded-[2rem]" />
      </Card>
      <Card className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
        </div>
      </Card>
      <Card className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-24 w-full rounded-[1.5rem]" />
        <Skeleton className="h-24 w-full rounded-[1.5rem]" />
      </Card>
    </div>
  );
}
