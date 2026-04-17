import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteTrip, getTripDetail } from '@/features/trips/api/trips-api';
import {
  createItineraryActivity,
  createItineraryDay,
  getTripBudgetSummary,
  getTripItinerary,
} from '@/features/trips/api/trip-planning-api';
import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import { TripDeleteButton } from '@/features/trips/components/trip-delete-button';
import { formatTripBudget, formatTripDate, formatTripDateRange } from '@/features/trips/lib/trip-presenters';
import { useI18n } from '@/shared/i18n/use-i18n';
import { ApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusBanner } from '@/shared/ui/status-banner';
import { Textarea } from '@/shared/ui/textarea';

type ActivityComposerState = {
  title: string;
  startsAt: string;
  location: string;
  notes: string;
  costAmount: string;
  costCurrency: string;
};

type TripRouteState = {
  noticeKey?: string;
};

export function TripDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { formatDate, language, t } = useI18n();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [dayDate, setDayDate] = useState('');
  const [activeComposerDayId, setActiveComposerDayId] = useState<string | null>(
    null,
  );
  const [activityComposerByDayId, setActivityComposerByDayId] = useState<
    Record<string, ActivityComposerState>
  >({});
  const noticeKey = (location.state as TripRouteState | null)?.noticeKey;
  const tripQuery = useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: ({ signal }) => getTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });
  const itineraryQuery = useQuery({
    queryKey: ['trips', 'itinerary', tripId],
    queryFn: ({ signal }) => getTripItinerary(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });
  const budgetSummaryQuery = useQuery({
    queryKey: ['trips', 'budget-summary', tripId],
    queryFn: ({ signal }) => getTripBudgetSummary(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });
  const createDayMutation = useMutation({
    mutationFn: (payload: { date: string }) =>
      createItineraryDay(tripId as string, payload),
    onSuccess: async () => {
      setDayDate('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'itinerary', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trips', 'budget-summary', tripId] }),
      ]);
    },
  });
  const createActivityMutation = useMutation({
    mutationFn: (payload: { dayId: string; form: ActivityComposerState }) =>
      createItineraryActivity(tripId as string, payload.dayId, {
        title: payload.form.title.trim(),
        startsAt: payload.form.startsAt.trim() || undefined,
        location: payload.form.location.trim() || undefined,
        notes: payload.form.notes.trim() || undefined,
        costAmount:
          payload.form.costAmount.trim().length > 0
            ? Number(payload.form.costAmount)
            : undefined,
        costCurrency: payload.form.costCurrency.trim() || undefined,
      }),
    onSuccess: async (_, variables) => {
      setActivityComposerByDayId((currentState) => ({
        ...currentState,
        [variables.dayId]: createEmptyActivityComposer(
          tripQuery.data?.budgetCurrency || 'VND',
        ),
      }));
      setActiveComposerDayId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'itinerary', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trips', 'budget-summary', tripId] }),
      ]);
    },
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

  async function handleCreateDay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tripId) {
      return;
    }

    const normalizedDate = dayDate.trim();

    if (normalizedDate.length === 0) {
      setPlannerError(t('trips.planner.validation.dayDateRequired'));
      return;
    }

    setPlannerError(null);

    try {
      await createDayMutation.mutateAsync({ date: normalizedDate });
    } catch (error) {
      setPlannerError(
        error instanceof ApiError && error.message
          ? error.message
          : t('trips.planner.feedback.createDayError'),
      );
    }
  }

  async function handleCreateActivity(
    event: React.FormEvent<HTMLFormElement>,
    dayId: string,
  ) {
    event.preventDefault();

    const form = activityComposerByDayId[dayId] ?? createEmptyActivityComposer(
      tripQuery.data?.budgetCurrency || 'VND',
    );

    if (form.title.trim().length === 0) {
      setPlannerError(t('trips.planner.validation.activityTitleRequired'));
      return;
    }

    setPlannerError(null);

    try {
      await createActivityMutation.mutateAsync({
        dayId,
        form,
      });
    } catch (error) {
      setPlannerError(
        error instanceof ApiError && error.message
          ? error.message
          : t('trips.planner.feedback.createActivityError'),
      );
    }
  }

  function openActivityComposer(dayId: string, currency: string) {
    setActiveComposerDayId(dayId);
    setActivityComposerByDayId((currentState) => ({
      ...currentState,
      [dayId]:
        currentState[dayId] ?? createEmptyActivityComposer(currency),
    }));
  }

  function updateActivityComposer(
    dayId: string,
    field: keyof ActivityComposerState,
    value: string,
  ) {
    setActivityComposerByDayId((currentState) => ({
      ...currentState,
      [dayId]: {
        ...(currentState[dayId] ??
          createEmptyActivityComposer(tripQuery.data?.budgetCurrency || 'VND')),
        [field]: value,
      },
    }));
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

  const itinerary = itineraryQuery.data;
  const budgetSummary = budgetSummaryQuery.data;

  return (
    <div className="space-y-5">
      <Card className="group overflow-hidden p-0">
        <div className="relative min-h-[320px]">
          <TripCoverImage
            alt={trip.name}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-105"
            src={trip.coverImageUrl}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.18),rgba(12,24,18,0.82))]" />
          <div className="relative flex min-h-[320px] flex-col justify-between gap-6 p-6 text-white sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <p className="eyebrow-text text-white/78">{t('trips.detailEyebrow')}</p>
                <div className="space-y-3">
                  <div className="inline-flex w-fit rounded-full bg-white/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                    {trip.destination}
                  </div>
                  <h1 className="headline text-4xl text-white sm:text-5xl">{trip.name}</h1>
                  <p className="max-w-3xl text-sm leading-7 text-white/82">
                    {trip.summaryNotes || t('trips.detailDescription')}
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

            <div className="flex flex-wrap gap-3 text-sm text-white/84">
              <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur-sm">
                {formatTripDateRange(trip.startDate, trip.endDate, language)}
              </div>
              <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur-sm">{trip.timezone}</div>
              <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur-sm">
                {formatTripBudget(trip.budgetAmount, trip.budgetCurrency, language)}
              </div>
            </div>
          </div>
        </div>

        {noticeKey || deleteError ? (
          <div className="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
            {noticeKey ? <StatusBanner tone="success">{t(noticeKey)}</StatusBanner> : null}
            {deleteError ? <StatusBanner tone="danger">{deleteError}</StatusBanner> : null}
          </div>
        ) : null}
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

        <div className="rounded-[1.5rem] bg-white/70 p-5 md:col-span-2">
          <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.summaryNotes')}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">
            {trip.summaryNotes || t('trips.notesEmpty')}
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

      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-text text-[var(--color-forest)]">
            {t('trips.planner.budgetEyebrow')}
          </p>
          <div className="space-y-2">
            <h2 className="headline text-3xl text-[var(--color-ink)]">
              {t('trips.planner.budgetTitle')}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('trips.planner.budgetDescription')}
            </p>
          </div>
        </div>

        {budgetSummaryQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : budgetSummary ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PlanningMetricCard
              label={t('trips.planner.metrics.totalBudget')}
              value={formatTripBudget(
                budgetSummary.totalBudgetAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t('trips.planner.metrics.plannedBudget')}
              value={formatTripBudget(
                budgetSummary.totalPlannedAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t('trips.planner.metrics.remainingBudget')}
              tone={budgetSummary.isOverBudget ? 'danger' : 'default'}
              value={formatTripBudget(
                budgetSummary.remainingAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t('trips.planner.metrics.totalNodes')}
              value={t('trips.planner.metrics.totalNodesValue', {
                days: budgetSummary.totalDays,
                activities: budgetSummary.totalActivities,
              })}
            />
          </div>
        ) : null}
      </Card>

      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-text text-[var(--color-forest)]">
            {t('trips.planner.eyebrow')}
          </p>
          <div className="space-y-2">
            <h2 className="headline text-3xl text-[var(--color-ink)]">
              {t('trips.planner.title')}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('trips.planner.description')}
            </p>
          </div>
        </div>

        {plannerError ? <StatusBanner tone="danger">{plannerError}</StatusBanner> : null}

        <form className="grid gap-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/60 p-5 md:grid-cols-[1fr_auto]" onSubmit={handleCreateDay}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="planner-day-date">
              {t('trips.planner.fields.dayDate')}
            </label>
            <Input
              id="planner-day-date"
              min={trip.startDate}
              max={trip.endDate}
              onChange={(event) => setDayDate(event.target.value)}
              type="date"
              value={dayDate}
            />
          </div>
          <div className="flex items-end">
            <Button disabled={createDayMutation.isPending} type="submit">
              {createDayMutation.isPending
                ? t('trips.planner.actions.addingDay')
                : t('trips.planner.actions.addDay')}
            </Button>
          </div>
        </form>

        {itineraryQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : itineraryQuery.isError ? (
          <StatusBanner tone="danger">
            {itineraryQuery.error instanceof ApiError && itineraryQuery.error.message
              ? itineraryQuery.error.message
              : t('trips.planner.feedback.loadError')}
          </StatusBanner>
        ) : itinerary && itinerary.days.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border-strong)] bg-white/50 p-6 text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('trips.planner.empty')}
          </div>
        ) : (
          <div className="space-y-5">
            {itinerary?.days.map((day, index) => {
              const activityComposer =
                activityComposerByDayId[day.id] ??
                createEmptyActivityComposer(trip.budgetCurrency);

              return (
                <div
                  className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/72 p-5 sm:p-6"
                  key={day.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="eyebrow-text-xs text-[var(--color-forest)]">
                        {t('trips.planner.dayLabel', { index: index + 1 })}
                      </p>
                      <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                        {formatTripDate(day.date, language)}
                      </h3>
                    </div>
                    <Button
                      onClick={() => openActivityComposer(day.id, trip.budgetCurrency)}
                      type="button"
                      variant="secondary"
                    >
                      {t('trips.planner.actions.addActivity')}
                    </Button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {day.activities.length === 0 ? (
                      <div className="rounded-[1.5rem] bg-[var(--color-surface-strong)] px-4 py-4 text-sm text-[var(--color-ink-soft)]">
                        {t('trips.planner.emptyDay')}
                      </div>
                    ) : (
                      day.activities.map((activity) => (
                        <div
                          className="rounded-[1.5rem] bg-[var(--color-surface-strong)] p-4"
                          key={activity.id}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <h4 className="text-lg font-semibold text-[var(--color-ink)]">
                                {activity.title}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-sm text-[var(--color-ink-soft)]">
                                {activity.startsAt ? (
                                  <span className="rounded-full bg-white px-3 py-1">
                                    {activity.startsAt}
                                  </span>
                                ) : null}
                                {activity.location ? (
                                  <span className="rounded-full bg-white px-3 py-1">
                                    {activity.location}
                                  </span>
                                ) : null}
                                <span className="rounded-full bg-white px-3 py-1">
                                  {formatTripBudget(
                                    activity.costAmount,
                                    activity.costCurrency,
                                    language,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          {activity.notes ? (
                            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                              {activity.notes}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}

                    {activeComposerDayId === day.id ? (
                      <form
                        className="grid gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4 md:grid-cols-2"
                        onSubmit={(event) => void handleCreateActivity(event, day.id)}
                      >
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-title-${day.id}`}>
                            {t('trips.planner.fields.activityTitle')}
                          </label>
                          <Input
                            id={`activity-title-${day.id}`}
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'title', event.target.value)
                            }
                            placeholder={t('trips.planner.placeholders.activityTitle')}
                            type="text"
                            value={activityComposer.title}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-time-${day.id}`}>
                            {t('trips.planner.fields.activityStartsAt')}
                          </label>
                          <Input
                            id={`activity-time-${day.id}`}
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'startsAt', event.target.value)
                            }
                            type="time"
                            value={activityComposer.startsAt}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-location-${day.id}`}>
                            {t('trips.planner.fields.activityLocation')}
                          </label>
                          <Input
                            id={`activity-location-${day.id}`}
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'location', event.target.value)
                            }
                            placeholder={t('trips.planner.placeholders.activityLocation')}
                            type="text"
                            value={activityComposer.location}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-cost-${day.id}`}>
                            {t('trips.planner.fields.activityCostAmount')}
                          </label>
                          <Input
                            id={`activity-cost-${day.id}`}
                            min="0"
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'costAmount', event.target.value)
                            }
                            step="1000"
                            type="number"
                            value={activityComposer.costAmount}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-currency-${day.id}`}>
                            {t('trips.planner.fields.activityCostCurrency')}
                          </label>
                          <Input
                            className="uppercase"
                            id={`activity-currency-${day.id}`}
                            maxLength={3}
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'costCurrency', event.target.value)
                            }
                            type="text"
                            value={activityComposer.costCurrency}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor={`activity-notes-${day.id}`}>
                            {t('trips.planner.fields.activityNotes')}
                          </label>
                          <Textarea
                            id={`activity-notes-${day.id}`}
                            onChange={(event) =>
                              updateActivityComposer(day.id, 'notes', event.target.value)
                            }
                            placeholder={t('trips.planner.placeholders.activityNotes')}
                            rows={4}
                            value={activityComposer.notes}
                          />
                        </div>

                        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                          <Button disabled={createActivityMutation.isPending} type="submit">
                            {createActivityMutation.isPending
                              ? t('trips.planner.actions.addingActivity')
                              : t('trips.planner.actions.saveActivity')}
                          </Button>
                          <Button
                            onClick={() => setActiveComposerDayId(null)}
                            type="button"
                            variant="secondary"
                          >
                            {t('trips.actions.cancel')}
                          </Button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TripDeleteButton
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        tripName={trip.name}
      />
    </div>
  );
}

function createEmptyActivityComposer(currency: string): ActivityComposerState {
  return {
    title: '',
    startsAt: '',
    location: '',
    notes: '',
    costAmount: '',
    costCurrency: currency,
  };
}

function PlanningMetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/70 p-5">
      <p className="eyebrow-text-xs text-[var(--color-forest)]">{label}</p>
      <p
        className={
          tone === 'danger'
            ? 'mt-2 text-lg font-semibold text-[var(--color-danger)]'
            : 'mt-2 text-lg font-semibold text-[var(--color-ink)]'
        }
      >
        {value}
      </p>
    </div>
  );
}
