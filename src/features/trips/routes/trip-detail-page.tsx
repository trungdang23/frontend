import { FormEvent, ReactNode, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteTrip, getTripDetail } from "@/features/trips/api/trips-api";
import {
  createItineraryActivity,
  createItineraryDay,
  deleteItineraryActivity,
  deleteItineraryDay,
  getTripBudgetSummary,
  getTripItinerary,
  updateItineraryActivity,
  updateItineraryDay,
} from "@/features/trips/api/trip-planning-api";
import { PlanningImageGallery } from "@/features/trips/components/planning-image-gallery";
import { TripCoverImage } from "@/features/trips/components/trip-cover-image";
import { TripDeleteButton } from "@/features/trips/components/trip-delete-button";
import {
  TripItineraryActivity,
  TripItineraryDay,
} from "@/features/trips/types/trip-planning";
import {
  formatTripConfiguredBudget,
  formatTripBudget,
  formatTripDate,
  formatTripDateRange,
  getTripBudgetModeLabel,
  getTripVisibilityLabel,
} from "@/features/trips/lib/trip-presenters";
import { ApiError } from "@/shared/api/api-error";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { getButtonClasses } from "@/shared/ui/button-styles";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatusBanner } from "@/shared/ui/status-banner";
import { Textarea } from "@/shared/ui/textarea";

type DayComposerState = {
  date: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
  costAmount: string;
  costCurrency: string;
  imageUrlsText: string;
};

type ActivityComposerState = {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string;
  costAmount: string;
  costCurrency: string;
  imageUrlsText: string;
};

type ActivityComposerTarget = {
  activityId?: string;
  dayId: string;
};

type TripRouteState = {
  noticeKey?: string;
};

export function TripDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { language, t } = useI18n();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [isCreateStopFormOpen, setIsCreateStopFormOpen] = useState(false);
  const [expandedDayIds, setExpandedDayIds] = useState<string[]>([]);
  const [createDayComposer, setCreateDayComposer] = useState<DayComposerState>(
    createEmptyDayComposer("VND"),
  );
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayComposer, setEditingDayComposer] =
    useState<DayComposerState>(createEmptyDayComposer("VND"));
  const [activityComposerTarget, setActivityComposerTarget] =
    useState<ActivityComposerTarget | null>(null);
  const [activityComposer, setActivityComposer] =
    useState<ActivityComposerState>(createEmptyActivityComposer("VND"));

  const noticeKey = (location.state as TripRouteState | null)?.noticeKey;
  const tripQuery = useQuery({
    queryKey: ["trips", "detail", tripId],
    queryFn: ({ signal }) => getTripDetail(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });
  const itineraryQuery = useQuery({
    queryKey: ["trips", "itinerary", tripId],
    queryFn: ({ signal }) => getTripItinerary(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });
  const budgetSummaryQuery = useQuery({
    queryKey: ["trips", "budget-summary", tripId],
    queryFn: ({ signal }) => getTripBudgetSummary(tripId as string, { signal }),
    enabled: Boolean(tripId),
  });

  const createDayMutation = useMutation({
    mutationFn: (payload: {
      costAmount?: number;
      costCurrency?: string;
      date: string;
      endsAt?: string;
      imageUrls?: string[];
      location?: string;
      notes?: string;
      startsAt?: string;
      title: string;
    }) => createItineraryDay(tripId as string, payload),
    onSuccess: async () => {
      setCreateDayComposer(
        createEmptyDayComposer(tripQuery.data?.budgetCurrency || "VND"),
      );
      setIsCreateStopFormOpen(false);
      await invalidatePlannerQueries(queryClient, tripId as string);
    },
  });
  const updateDayMutation = useMutation({
    mutationFn: (payload: { dayId: string; form: DayComposerState }) =>
      updateItineraryDay(tripId as string, payload.dayId, {
        date: payload.form.date.trim(),
        title: payload.form.title.trim(),
        startsAt: toOptionalString(payload.form.startsAt),
        endsAt: toOptionalString(payload.form.endsAt),
        location: toOptionalString(payload.form.location),
        notes: toOptionalString(payload.form.notes),
        costAmount: toOptionalNumber(payload.form.costAmount),
        costCurrency: toOptionalString(payload.form.costCurrency),
        imageUrls: parseImageUrls(payload.form.imageUrlsText),
      }),
    onSuccess: async () => {
      setEditingDayId(null);
      setEditingDayComposer(
        createEmptyDayComposer(tripQuery.data?.budgetCurrency || "VND"),
      );
      await invalidatePlannerQueries(queryClient, tripId as string);
    },
  });
  const deleteDayMutation = useMutation({
    mutationFn: (dayId: string) => deleteItineraryDay(tripId as string, dayId),
    onSuccess: async (_data, dayId) => {
      setEditingDayId(null);
      setActivityComposerTarget(null);
      setExpandedDayIds((currentValue) =>
        currentValue.filter((currentDayId) => currentDayId !== dayId),
      );
      await invalidatePlannerQueries(queryClient, tripId as string);
    },
  });
  const createActivityMutation = useMutation({
    mutationFn: (payload: { dayId: string; form: ActivityComposerState }) =>
      createItineraryActivity(tripId as string, payload.dayId, {
        title: payload.form.title.trim(),
        startsAt: toOptionalString(payload.form.startsAt),
        endsAt: toOptionalString(payload.form.endsAt),
        location: toOptionalString(payload.form.location),
        notes: toOptionalString(payload.form.notes),
        costAmount: toOptionalNumber(payload.form.costAmount),
        costCurrency: toOptionalString(payload.form.costCurrency),
        imageUrls: parseImageUrls(payload.form.imageUrlsText),
      }),
    onSuccess: async () => {
      setActivityComposerTarget(null);
      setActivityComposer(
        createEmptyActivityComposer(tripQuery.data?.budgetCurrency || "VND"),
      );
      await invalidatePlannerQueries(queryClient, tripId as string);
    },
  });
  const updateActivityMutation = useMutation({
    mutationFn: (payload: {
      activityId: string;
      dayId: string;
      form: ActivityComposerState;
    }) =>
      updateItineraryActivity(
        tripId as string,
        payload.dayId,
        payload.activityId,
        {
          title: payload.form.title.trim(),
          startsAt: toOptionalString(payload.form.startsAt),
          endsAt: toOptionalString(payload.form.endsAt),
          location: toOptionalString(payload.form.location),
          notes: toOptionalString(payload.form.notes),
          costAmount: toOptionalNumber(payload.form.costAmount),
          costCurrency: toOptionalString(payload.form.costCurrency),
          imageUrls: parseImageUrls(payload.form.imageUrlsText),
        },
      ),
    onSuccess: async () => {
      setActivityComposerTarget(null);
      setActivityComposer(
        createEmptyActivityComposer(tripQuery.data?.budgetCurrency || "VND"),
      );
      await invalidatePlannerQueries(queryClient, tripId as string);
    },
  });
  const deleteActivityMutation = useMutation({
    mutationFn: (payload: { activityId: string; dayId: string }) =>
      deleteItineraryActivity(
        tripId as string,
        payload.dayId,
        payload.activityId,
      ),
    onSuccess: async () => {
      setActivityComposerTarget(null);
      await invalidatePlannerQueries(queryClient, tripId as string);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips", "list"] }),
        queryClient.invalidateQueries({
          queryKey: ["trips", "detail", tripId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["trips", "budget-summary", tripId],
        }),
      ]);
      navigate("/app/trips", {
        replace: true,
        state: { noticeKey: "trips.feedback.deleteSuccess" },
      });
    } catch (error) {
      setDeleteError(
        error instanceof ApiError && error.message
          ? error.message
          : t("trips.feedback.deleteError"),
      );
      setIsDeleting(false);
    }
  }

  async function handleCreateDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tripId) {
      return;
    }

    if (createDayComposer.date.trim().length === 0) {
      setPlannerError(t("trips.planner.validation.stopDateRequired"));
      return;
    }

    if (createDayComposer.title.trim().length === 0) {
      setPlannerError(t("trips.planner.validation.stopTitleRequired"));
      return;
    }

    setPlannerError(null);

    try {
      await createDayMutation.mutateAsync({
        date: createDayComposer.date.trim(),
        title: createDayComposer.title.trim(),
        startsAt: toOptionalString(createDayComposer.startsAt) ?? undefined,
        endsAt: toOptionalString(createDayComposer.endsAt) ?? undefined,
        location: toOptionalString(createDayComposer.location) ?? undefined,
        notes: toOptionalString(createDayComposer.notes) ?? undefined,
        costAmount: toOptionalNumber(createDayComposer.costAmount),
        costCurrency:
          toOptionalString(createDayComposer.costCurrency) ?? undefined,
        imageUrls: parseImageUrls(createDayComposer.imageUrlsText),
      });
    } catch (error) {
      setPlannerError(
        getPlannerErrorMessage(
          error,
          t("trips.planner.feedback.createStopError"),
        ),
      );
    }
  }

  async function handleUpdateDay(
    event: FormEvent<HTMLFormElement>,
    dayId: string,
  ) {
    event.preventDefault();

    if (editingDayComposer.date.trim().length === 0) {
      setPlannerError(t("trips.planner.validation.stopDateRequired"));
      return;
    }

    if (editingDayComposer.title.trim().length === 0) {
      setPlannerError(t("trips.planner.validation.stopTitleRequired"));
      return;
    }

    setPlannerError(null);

    try {
      await updateDayMutation.mutateAsync({
        dayId,
        form: editingDayComposer,
      });
    } catch (error) {
      setPlannerError(
        getPlannerErrorMessage(
          error,
          t("trips.planner.feedback.updateStopError"),
        ),
      );
    }
  }

  async function handleDeleteDay(day: TripItineraryDay) {
    if (
      !window.confirm(
        t("trips.planner.confirmations.deleteStop", { title: day.title }),
      )
    ) {
      return;
    }

    setPlannerError(null);

    try {
      await deleteDayMutation.mutateAsync(day.id);
    } catch (error) {
      setPlannerError(
        getPlannerErrorMessage(
          error,
          t("trips.planner.feedback.deleteStopError"),
        ),
      );
    }
  }

  async function handleActivitySubmit(
    event: FormEvent<HTMLFormElement>,
    dayId: string,
  ) {
    event.preventDefault();

    if (activityComposer.title.trim().length === 0) {
      setPlannerError(t("trips.planner.validation.activityTitleRequired"));
      return;
    }

    setPlannerError(null);

    try {
      if (activityComposerTarget?.activityId) {
        await updateActivityMutation.mutateAsync({
          dayId,
          activityId: activityComposerTarget.activityId,
          form: activityComposer,
        });
      } else {
        await createActivityMutation.mutateAsync({
          dayId,
          form: activityComposer,
        });
      }
    } catch (error) {
      setPlannerError(
        getPlannerErrorMessage(
          error,
          activityComposerTarget?.activityId
            ? t("trips.planner.feedback.updateActivityError")
            : t("trips.planner.feedback.createActivityError"),
        ),
      );
    }
  }

  async function handleDeleteActivity(
    day: TripItineraryDay,
    activity: TripItineraryActivity,
  ) {
    if (
      !window.confirm(
        t("trips.planner.confirmations.deleteActivity", {
          title: activity.title,
        }),
      )
    ) {
      return;
    }

    setPlannerError(null);

    try {
      await deleteActivityMutation.mutateAsync({
        dayId: day.id,
        activityId: activity.id,
      });
    } catch (error) {
      setPlannerError(
        getPlannerErrorMessage(
          error,
          t("trips.planner.feedback.deleteActivityError"),
        ),
      );
    }
  }

  function openDayEditor(day: TripItineraryDay) {
    setPlannerError(null);
    setEditingDayId(day.id);
    setEditingDayComposer(createDayComposerFromDay(day));
  }

  function toggleDayExpansion(dayId: string) {
    setExpandedDayIds((currentValue) =>
      currentValue.includes(dayId)
        ? currentValue.filter((currentDayId) => currentDayId !== dayId)
        : [...currentValue, dayId],
    );
  }

  function ensureDayExpanded(dayId: string) {
    setExpandedDayIds((currentValue) =>
      currentValue.includes(dayId) ? currentValue : [...currentValue, dayId],
    );
  }

  function openActivityCreator(day: TripItineraryDay) {
    setPlannerError(null);
    ensureDayExpanded(day.id);
    setActivityComposerTarget({ dayId: day.id });
    setActivityComposer(createEmptyActivityComposer(day.costCurrency));
  }

  function openActivityEditor(
    day: TripItineraryDay,
    activity: TripItineraryActivity,
  ) {
    setPlannerError(null);
    ensureDayExpanded(day.id);
    setActivityComposerTarget({
      dayId: day.id,
      activityId: activity.id,
    });
    setActivityComposer(createActivityComposerFromActivity(activity));
  }

  if (!tripId) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t("trips.actions.backToList")}
          </Link>
        }
        description={t("trips.notFoundDescription")}
        eyebrow={t("trips.detailEyebrow")}
        title={t("trips.notFoundTitle")}
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

  if (
    tripQuery.isError &&
    tripQuery.error instanceof ApiError &&
    tripQuery.error.status === 404
  ) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t("trips.actions.backToList")}
          </Link>
        }
        description={t("trips.notFoundDescription")}
        eyebrow={t("trips.detailEyebrow")}
        title={t("trips.notFoundTitle")}
      />
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/trips">
            {t("trips.actions.backToList")}
          </Link>
        }
        description={t("trips.feedback.loadDetailError")}
        eyebrow={t("trips.detailEyebrow")}
        title={t("trips.feedback.loadDetailTitle")}
      />
    );
  }

  const trip = tripQuery.data;
  const itinerary = itineraryQuery.data;
  const budgetSummary = budgetSummaryQuery.data;
  return (
    <div className="space-y-5">
      <Card className="group overflow-hidden p-0">
        <div className="relative overflow-hidden">
          <TripCoverImage
            alt={trip.name}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-105"
            src={trip.coverImageUrl}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.22),rgba(12,24,18,0.82))]" />
          <div className="relative grid gap-6 p-6 text-white sm:p-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <p className="eyebrow-text text-white/72">
                {t("trips.detailEyebrow")}
              </p>
              <div className="space-y-3">
                <h1 className="headline text-4xl text-white sm:text-5xl">
                  {trip.name}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
                  {trip.summaryNotes || t("trips.notesEmpty")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-white/82">
                <span className="rounded-full bg-white/14 px-3 py-1">
                  {formatTripDateRange(trip.startDate, trip.endDate, language)}
                </span>
                <span className="rounded-full bg-white/14 px-3 py-1">
                  {getTripVisibilityLabel(trip.visibility, t)}
                </span>
                <span className="rounded-full bg-white/14 px-3 py-1">
                  {getTripBudgetModeLabel(trip.budgetMode, t)}
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/14 bg-white/10 p-5 backdrop-blur-md">
              <p className="eyebrow-text-xs text-white/70">
                {t("trips.overviewEyebrow")}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {formatTripDateRange(trip.startDate, trip.endDate, language)}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/76">
                {t("trips.overviewDescription")}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  className={getButtonClasses()}
                  to={`/app/trips/${trip.id}/edit`}
                >
                  {t("trips.actions.edit")}
                </Link>
                <Link
                  className={`${getButtonClasses("secondary")} border-white/30 bg-white text-[var(--color-ink)] hover:bg-white/92`}
                  to="/app/trips"
                >
                  {t("trips.actions.backToList")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {noticeKey ? (
        <StatusBanner tone="success">{t(noticeKey)}</StatusBanner>
      ) : null}
      {deleteError ? (
        <StatusBanner tone="danger">{deleteError}</StatusBanner>
      ) : null}

      <Card className="space-y-5">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] xl:items-start">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">
              {t("trips.overviewEyebrow")}
            </p>
            <div className="space-y-3">
              <h2 className="headline text-3xl text-[var(--color-ink)]">
                {t("trips.overviewTitle")}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t("trips.overviewDescription")}
              </p>
            </div>
            <div className="grid gap-4 rounded-[1.5rem] bg-[var(--color-surface-strong)] px-5 py-4 md:grid-cols-2">
              <div>
                <p className="eyebrow-text-xs text-[var(--color-forest)]">
                  {t("trips.fields.dateRange")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                  {formatTripDateRange(trip.startDate, trip.endDate, language)}
                </p>
              </div>
              <div>
                <p className="eyebrow-text-xs text-[var(--color-forest)]">
                  {t("trips.fields.visibility")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                  {getTripVisibilityLabel(trip.visibility, t)}
                </p>
              </div>
              <div>
                <p className="eyebrow-text-xs text-[var(--color-forest)]">
                  {t("trips.fields.budgetMode")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                  {getTripBudgetModeLabel(trip.budgetMode, t)}
                </p>
              </div>
              <div>
                <p className="eyebrow-text-xs text-[var(--color-forest)]">
                  {t("trips.fields.budget")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                  {formatTripConfiguredBudget(trip, language, t)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">
              {t("trips.planner.budgetEyebrow")}
            </p>
            <div className="space-y-2">
              <h2 className="headline text-3xl text-[var(--color-ink)]">
                {t("trips.planner.budgetTitle")}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                {t("trips.planner.budgetDescription")}
              </p>
            </div>
          </div>
        </div>

        {budgetSummaryQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : budgetSummary ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PlanningMetricCard
              label={t("trips.planner.metrics.totalBudget")}
              value={formatTripBudget(
                budgetSummary.totalBudgetAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t("trips.planner.metrics.plannedBudget")}
              value={formatTripBudget(
                budgetSummary.totalPlannedAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t("trips.planner.metrics.remainingBudget")}
              tone={budgetSummary.isOverBudget ? "danger" : "default"}
              value={formatTripBudget(
                budgetSummary.remainingAmount,
                budgetSummary.currency,
                language,
              )}
            />
            <PlanningMetricCard
              label={t("trips.planner.metrics.totalNodes")}
              value={t("trips.planner.metrics.totalNodesValue", {
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
            {t("trips.planner.eyebrow")}
          </p>
          <div className="space-y-2">
            <h2 className="headline text-3xl text-[var(--color-ink)]">
              {t("trips.planner.title")}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t("trips.planner.description")}
            </p>
          </div>
        </div>

        {plannerError ? (
          <StatusBanner tone="danger">{plannerError}</StatusBanner>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              setIsCreateStopFormOpen((currentValue) => !currentValue)
            }
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isCreateStopFormOpen
                ? t("trips.planner.actions.hideStopForm")
                : t("trips.planner.actions.showStopForm")}
            </span>
          </Button>
        </div>

        {isCreateStopFormOpen ? (
          <PlannerDayForm
            maxDate={trip.endDate}
            minDate={trip.startDate}
            mode="create"
            onCancel={() => setIsCreateStopFormOpen(false)}
            onChange={setCreateDayComposer}
            onSubmit={(event) => void handleCreateDay(event)}
            submitLabel={
              createDayMutation.isPending
                ? t("trips.planner.actions.addingStop")
                : t("trips.planner.actions.addStop")
            }
            title={t("trips.planner.createStopTitle")}
            value={createDayComposer}
          />
        ) : null}

        {itineraryQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : itineraryQuery.isError ? (
          <StatusBanner tone="danger">
            {itineraryQuery.error instanceof ApiError &&
            itineraryQuery.error.message
              ? itineraryQuery.error.message
              : t("trips.planner.feedback.loadError")}
          </StatusBanner>
        ) : itinerary && itinerary.days.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[var(--color-border-strong)] bg-white/50 p-6">
            <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
              {t("trips.planner.empty")}
            </p>
            {!isCreateStopFormOpen ? (
              <div className="mt-4">
                <Button
                  onClick={() => setIsCreateStopFormOpen(true)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t("trips.planner.actions.addFirstStop")}
                  </span>
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            {itinerary?.days.map((day, index) => {
              const isDayExpanded =
                expandedDayIds.includes(day.id) ||
                activityComposerTarget?.dayId === day.id;

              return (
                <div
                  className="rounded-[1.85rem] border border-[var(--color-border)] bg-white/75 p-5 shadow-sm"
                  key={day.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button
                      aria-controls={`planner-day-children-${day.id}`}
                      aria-expanded={isDayExpanded}
                      className="-m-2 flex-1 rounded-[1.4rem] p-2 text-left transition hover:bg-[var(--color-surface-strong)]"
                      onClick={() => toggleDayExpansion(day.id)}
                      type="button"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[rgba(84,107,65,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-forest)]">
                            {t("trips.planner.stopLabel", { index: index + 1 })}
                          </span>
                          <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-sm text-[var(--color-ink-soft)]">
                            {formatTripDate(day.date, language)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                            {day.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-[var(--color-ink-soft)]">
                            {formatTimeRange(day.startsAt, day.endsAt) ? (
                              <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                                {formatTimeRange(day.startsAt, day.endsAt)}
                              </span>
                            ) : null}
                            {day.location ? (
                              <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                                {day.location}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                              {formatTripBudget(
                                day.costAmount,
                                day.costCurrency,
                                language,
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
                          <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-[var(--color-ink-soft)]">
                            {t("trips.planner.childCount", {
                              count: day.activities.length,
                            })}
                          </span>
                          <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-forest)]">
                            {isDayExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {isDayExpanded
                              ? t("trips.planner.actions.hideChildren")
                              : t("trips.planner.actions.showChildren")}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => openActivityCreator(day)}
                        type="button"
                        variant="secondary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          {t("trips.planner.actions.addActivity")}
                        </span>
                      </Button>
                      <Button
                        onClick={() => openDayEditor(day)}
                        type="button"
                        variant="secondary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <PencilLine className="h-4 w-4" />
                          {t("trips.actions.edit")}
                        </span>
                      </Button>
                      <Button
                        onClick={() => void handleDeleteDay(day)}
                        type="button"
                        variant="secondary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          {t("trips.planner.actions.deleteStop")}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {day.notes ? (
                    <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                      {day.notes}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    <PlanningImageGallery
                      altPrefix={day.title}
                      imageUrls={day.imageUrls}
                    />
                  </div>

                  {editingDayId === day.id ? (
                    <div className="mt-6">
                      <PlannerDayForm
                        maxDate={trip.endDate}
                        minDate={trip.startDate}
                        mode="edit"
                        onCancel={() => setEditingDayId(null)}
                        onChange={setEditingDayComposer}
                        onSubmit={(event) =>
                          void handleUpdateDay(event, day.id)
                        }
                        submitLabel={
                          updateDayMutation.isPending
                            ? t("trips.planner.actions.savingStop")
                            : t("trips.planner.actions.saveStop")
                        }
                        title={t("trips.planner.editStopTitle")}
                        value={editingDayComposer}
                      />
                    </div>
                  ) : null}

                  {isDayExpanded ? (
                    <div
                      className="mt-6 space-y-4"
                      id={`planner-day-children-${day.id}`}
                    >
                      {day.activities.length === 0 ? (
                        <div className="rounded-[1.5rem] bg-[var(--color-surface-strong)] px-4 py-4 text-sm text-[var(--color-ink-soft)]">
                          {t("trips.planner.emptyDay")}
                        </div>
                      ) : (
                        day.activities.map((activity) => (
                          <div
                            className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4"
                            key={activity.id}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-[rgba(84,107,65,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-forest)]">
                                    {t("trips.planner.childLabel")}
                                  </span>
                                </div>
                                <h4 className="text-lg font-semibold text-[var(--color-ink)]">
                                  {activity.title}
                                </h4>
                                <div className="flex flex-wrap gap-2 text-sm text-[var(--color-ink-soft)]">
                                  {formatTimeRange(
                                    activity.startsAt,
                                    activity.endsAt,
                                  ) ? (
                                    <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                                      {formatTimeRange(
                                        activity.startsAt,
                                        activity.endsAt,
                                      )}
                                    </span>
                                  ) : null}
                                  {activity.location ? (
                                    <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                                      {activity.location}
                                    </span>
                                  ) : null}
                                  <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1">
                                    {formatTripBudget(
                                      activity.costAmount,
                                      activity.costCurrency,
                                      language,
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <Button
                                  onClick={() =>
                                    openActivityEditor(day, activity)
                                  }
                                  type="button"
                                  variant="secondary"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <PencilLine className="h-4 w-4" />
                                    {t("trips.actions.edit")}
                                  </span>
                                </Button>
                                <Button
                                  onClick={() =>
                                    void handleDeleteActivity(day, activity)
                                  }
                                  type="button"
                                  variant="secondary"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    {t("trips.planner.actions.deleteActivity")}
                                  </span>
                                </Button>
                              </div>
                            </div>

                            {activity.notes ? (
                              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                                {activity.notes}
                              </p>
                            ) : null}

                            <div className="mt-4">
                              <PlanningImageGallery
                                altPrefix={activity.title}
                                imageUrls={activity.imageUrls}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}

                  {activityComposerTarget?.dayId === day.id ? (
                    <div className="mt-6">
                      <PlannerActivityForm
                        mode={
                          activityComposerTarget.activityId ? "edit" : "create"
                        }
                        onCancel={() => setActivityComposerTarget(null)}
                        onChange={setActivityComposer}
                        onSubmit={(event) =>
                          void handleActivitySubmit(event, day.id)
                        }
                        submitLabel={
                          activityComposerTarget.activityId
                            ? updateActivityMutation.isPending
                              ? t("trips.planner.actions.savingActivity")
                              : t("trips.planner.actions.saveActivity")
                            : createActivityMutation.isPending
                              ? t("trips.planner.actions.addingActivity")
                              : t("trips.planner.actions.addActivity")
                        }
                        title={
                          activityComposerTarget.activityId
                            ? t("trips.planner.editActivityTitle")
                            : t("trips.planner.createActivityTitle")
                        }
                        value={activityComposer}
                      />
                    </div>
                  ) : null}
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

function PlannerDayForm({
  maxDate,
  minDate,
  mode,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  title,
  value,
}: {
  maxDate: string;
  minDate: string;
  mode: "create" | "edit";
  onCancel?: () => void;
  onChange: (value: DayComposerState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  title: string;
  value: DayComposerState;
}) {
  const { t } = useI18n();

  return (
    <form
      className="grid gap-4 rounded-[1.85rem] border border-[var(--color-border)] bg-white/65 p-5 md:grid-cols-2"
      onSubmit={onSubmit}
    >
      <div className="space-y-1 md:col-span-2">
        <h3 className="text-lg font-semibold text-[var(--color-ink)]">
          {title}
        </h3>
        <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
          {t("trips.planner.formDescription")}
        </p>
      </div>

      <Field
        label={t("trips.planner.fields.stopDate")}
        htmlFor={`planner-stop-date-${mode}`}
      >
        <Input
          id={`planner-stop-date-${mode}`}
          max={maxDate}
          min={minDate}
          onChange={(event) => onChange({ ...value, date: event.target.value })}
          type="date"
          value={value.date}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.stopTitle")}
        htmlFor={`planner-stop-title-${mode}`}
      >
        <Input
          id={`planner-stop-title-${mode}`}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.stopTitle")}
          type="text"
          value={value.title}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.startsAt")}
        htmlFor={`planner-stop-starts-at-${mode}`}
      >
        <Input
          id={`planner-stop-starts-at-${mode}`}
          onChange={(event) =>
            onChange({ ...value, startsAt: event.target.value })
          }
          type="time"
          value={value.startsAt}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.endsAt")}
        htmlFor={`planner-stop-ends-at-${mode}`}
      >
        <Input
          id={`planner-stop-ends-at-${mode}`}
          onChange={(event) =>
            onChange({ ...value, endsAt: event.target.value })
          }
          type="time"
          value={value.endsAt}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.location")}
        htmlFor={`planner-stop-location-${mode}`}
      >
        <Input
          id={`planner-stop-location-${mode}`}
          onChange={(event) =>
            onChange({ ...value, location: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.stopLocation")}
          type="text"
          value={value.location}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.costAmount")}
        htmlFor={`planner-stop-cost-${mode}`}
      >
        <Input
          id={`planner-stop-cost-${mode}`}
          min="0"
          onChange={(event) =>
            onChange({ ...value, costAmount: event.target.value })
          }
          step="1000"
          type="number"
          value={value.costAmount}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.costCurrency")}
        htmlFor={`planner-stop-currency-${mode}`}
      >
        <Input
          className="uppercase"
          id={`planner-stop-currency-${mode}`}
          maxLength={3}
          onChange={(event) =>
            onChange({ ...value, costCurrency: event.target.value })
          }
          type="text"
          value={value.costCurrency}
        />
      </Field>

      <Field
        className="md:col-span-2"
        label={t("trips.planner.fields.notes")}
        htmlFor={`planner-stop-notes-${mode}`}
      >
        <Textarea
          id={`planner-stop-notes-${mode}`}
          onChange={(event) =>
            onChange({ ...value, notes: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.stopNotes")}
          rows={4}
          value={value.notes}
        />
      </Field>

      <Field
        className="md:col-span-2"
        label={t("trips.planner.fields.imageUrls")}
        htmlFor={`planner-stop-images-${mode}`}
      >
        <Textarea
          id={`planner-stop-images-${mode}`}
          onChange={(event) =>
            onChange({ ...value, imageUrlsText: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.imageUrls")}
          rows={4}
          value={value.imageUrlsText}
        />
      </Field>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
        <Button type="submit">{submitLabel}</Button>
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="secondary">
            {t("trips.actions.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function PlannerActivityForm({
  mode,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  title,
  value,
}: {
  mode: "create" | "edit";
  onCancel: () => void;
  onChange: (value: ActivityComposerState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  title: string;
  value: ActivityComposerState;
}) {
  const { t } = useI18n();

  return (
    <form
      className="grid gap-4 rounded-[1.7rem] border border-[var(--color-border)] bg-white p-5 md:grid-cols-2"
      onSubmit={onSubmit}
    >
      <div className="space-y-1 md:col-span-2">
        <h4 className="text-lg font-semibold text-[var(--color-ink)]">
          {title}
        </h4>
        <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
          {t("trips.planner.childFormDescription")}
        </p>
      </div>

      <Field
        className="md:col-span-2"
        label={t("trips.planner.fields.activityTitle")}
        htmlFor={`planner-activity-title-${mode}`}
      >
        <Input
          id={`planner-activity-title-${mode}`}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.activityTitle")}
          type="text"
          value={value.title}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.startsAt")}
        htmlFor={`planner-activity-starts-at-${mode}`}
      >
        <Input
          id={`planner-activity-starts-at-${mode}`}
          onChange={(event) =>
            onChange({ ...value, startsAt: event.target.value })
          }
          type="time"
          value={value.startsAt}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.endsAt")}
        htmlFor={`planner-activity-ends-at-${mode}`}
      >
        <Input
          id={`planner-activity-ends-at-${mode}`}
          onChange={(event) =>
            onChange({ ...value, endsAt: event.target.value })
          }
          type="time"
          value={value.endsAt}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.location")}
        htmlFor={`planner-activity-location-${mode}`}
      >
        <Input
          id={`planner-activity-location-${mode}`}
          onChange={(event) =>
            onChange({ ...value, location: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.activityLocation")}
          type="text"
          value={value.location}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.costAmount")}
        htmlFor={`planner-activity-cost-${mode}`}
      >
        <Input
          id={`planner-activity-cost-${mode}`}
          min="0"
          onChange={(event) =>
            onChange({ ...value, costAmount: event.target.value })
          }
          step="1000"
          type="number"
          value={value.costAmount}
        />
      </Field>

      <Field
        label={t("trips.planner.fields.costCurrency")}
        htmlFor={`planner-activity-currency-${mode}`}
      >
        <Input
          className="uppercase"
          id={`planner-activity-currency-${mode}`}
          maxLength={3}
          onChange={(event) =>
            onChange({ ...value, costCurrency: event.target.value })
          }
          type="text"
          value={value.costCurrency}
        />
      </Field>

      <Field
        className="md:col-span-2"
        label={t("trips.planner.fields.notes")}
        htmlFor={`planner-activity-notes-${mode}`}
      >
        <Textarea
          id={`planner-activity-notes-${mode}`}
          onChange={(event) =>
            onChange({ ...value, notes: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.activityNotes")}
          rows={4}
          value={value.notes}
        />
      </Field>

      <Field
        className="md:col-span-2"
        label={t("trips.planner.fields.imageUrls")}
        htmlFor={`planner-activity-images-${mode}`}
      >
        <Textarea
          id={`planner-activity-images-${mode}`}
          onChange={(event) =>
            onChange({ ...value, imageUrlsText: event.target.value })
          }
          placeholder={t("trips.planner.placeholders.imageUrls")}
          rows={4}
          value={value.imageUrlsText}
        />
      </Field>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
        <Button type="submit">{submitLabel}</Button>
        <Button onClick={onCancel} type="button" variant="secondary">
          {t("trips.actions.cancel")}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  className = "",
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <label
        className="text-sm font-medium text-[var(--color-ink)]"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function createEmptyDayComposer(currency: string): DayComposerState {
  return {
    date: "",
    title: "",
    startsAt: "",
    endsAt: "",
    location: "",
    notes: "",
    costAmount: "",
    costCurrency: currency,
    imageUrlsText: "",
  };
}

function createEmptyActivityComposer(currency: string): ActivityComposerState {
  return {
    title: "",
    startsAt: "",
    endsAt: "",
    location: "",
    notes: "",
    costAmount: "",
    costCurrency: currency,
    imageUrlsText: "",
  };
}

function createDayComposerFromDay(day: TripItineraryDay): DayComposerState {
  return {
    date: day.date,
    title: day.title,
    startsAt: day.startsAt ?? "",
    endsAt: day.endsAt ?? "",
    location: day.location ?? "",
    notes: day.notes ?? "",
    costAmount: day.costAmount > 0 ? String(day.costAmount) : "",
    costCurrency: day.costCurrency,
    imageUrlsText: day.imageUrls.join("\n"),
  };
}

function createActivityComposerFromActivity(
  activity: TripItineraryActivity,
): ActivityComposerState {
  return {
    title: activity.title,
    startsAt: activity.startsAt ?? "",
    endsAt: activity.endsAt ?? "",
    location: activity.location ?? "",
    notes: activity.notes ?? "",
    costAmount: activity.costAmount > 0 ? String(activity.costAmount) : "",
    costCurrency: activity.costCurrency,
    imageUrlsText: activity.imageUrls.join("\n"),
  };
}

function getPlannerErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof ApiError && error.message
    ? error.message
    : fallbackMessage;
}

async function invalidatePlannerQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  tripId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["trips", "itinerary", tripId] }),
    queryClient.invalidateQueries({
      queryKey: ["trips", "budget-summary", tripId],
    }),
  ]);
}

function parseImageUrls(value: string): string[] {
  return value
    .split("\n")
    .map((imageUrl) => imageUrl.trim())
    .filter(Boolean);
}

function toOptionalString(value: string): string | undefined {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function toOptionalNumber(value: string): number | undefined {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return undefined;
  }

  return Number(normalizedValue);
}

function formatTimeRange(
  startsAt: string | null,
  endsAt: string | null,
): string | null {
  if (startsAt && endsAt) {
    return `${startsAt} - ${endsAt}`;
  }

  if (startsAt) {
    return startsAt;
  }

  if (endsAt) {
    return endsAt;
  }

  return null;
}

function PlanningMetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/70 p-5">
      <p className="eyebrow-text-xs text-[var(--color-forest)]">{label}</p>
      <p
        className={
          tone === "danger"
            ? "mt-2 text-lg font-semibold text-[var(--color-danger)]"
            : "mt-2 text-lg font-semibold text-[var(--color-ink)]"
        }
      >
        {value}
      </p>
    </div>
  );
}
