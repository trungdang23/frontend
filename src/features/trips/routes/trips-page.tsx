import {
  type ReactNode,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Globe2,
  MapPin,
  PenSquare,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  buildJournalTripPath,
  buildPlannerTripPath,
} from '@/app/router/trip-route-redirects';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import {
  deleteTrip,
  listTrips,
} from '@/features/trips/api/trips-api';
import type { Trip } from '@/features/trips/types/trip';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const WORKSPACE_TRIP_QUERY = {
  page: 0,
  size: 100,
  sort: 'startDate,desc' as const,
};

const fallbackCoverImages = [
  '/images/defaults/planner-hoian.svg',
  '/images/defaults/planner-hanoi.svg',
  '/images/defaults/planner-halong.svg',
  '/images/defaults/planner-danang.svg',
];

type TripsPageFeedback = {
  kind: 'error' | 'success';
  message: string;
};

export function TripsPage() {
  const { formatDate, t } = useI18n();
  const queryClient = useQueryClient();
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<TripsPageFeedback | null>(null);
  const tripsQuery = useQuery({
    queryFn: ({ signal }) => listTrips(WORKSPACE_TRIP_QUERY, { signal }),
    queryKey: ['trips', 'list', 'workspace', WORKSPACE_TRIP_QUERY],
  });
  const trips = tripsQuery.data?.data ?? [];

  const handleDeleteTrip = async (trip: Trip) => {
    if (deletingTripId) {
      return;
    }

    const shouldDelete = window.confirm(
      t('profile.actions.deletePlannerConfirm', { title: trip.name }),
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingTripId(trip.id);
    setFeedback(null);

    try {
      await deleteTrip(trip.id);
      await queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
      setFeedback({
        kind: 'success',
        message: t('profile.actions.deletePlannerSuccess', { title: trip.name }),
      });
    } catch {
      setFeedback({
        kind: 'error',
        message: t('profile.actions.deletePlannerError', { title: trip.name }),
      });
    } finally {
      setDeletingTripId(null);
    }
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.community}
      mainId="workspace-trips-content"
      scrollable
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-5 lg:py-7">
        <section className="relative overflow-hidden rounded-[1.2rem] border border-[#eadbc5] bg-[linear-gradient(135deg,rgba(255,252,244,0.96),rgba(246,234,210,0.95))] px-5 py-6 shadow-[0_20px_40px_rgba(76,51,33,0.12)] sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#9f7d58_0.9px,transparent_0.9px)] [background-size:20px_20px]" />
          <div className="pointer-events-none absolute -right-8 top-3 h-16 w-36 rotate-[10deg] bg-[#f6d78d]/60 shadow-[0_12px_18px_rgba(93,67,40,0.12)]" />
          <div className="pointer-events-none absolute -left-4 bottom-5 h-12 w-28 -rotate-[8deg] bg-[#a8dfd5]/70 shadow-[0_10px_16px_rgba(72,109,98,0.12)]" />

          <div className="relative flex items-center justify-between gap-4">
            <h1 className="font-cursive text-[3rem] leading-none text-[#2c1f18] sm:text-[3.8rem]">
              {t('trips.listEyebrow')}
            </h1>

            <Link
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-5 py-3 font-marker font-bold leading-none text-[#172612] shadow-[0_6px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
              to="/app/trips/new"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {t('trips.actions.create')}
            </Link>
          </div>
        </section>

        {feedback ? (
          <p
            className={cn(
              'rounded-[0.9rem] border px-4 py-3 font-marker text-[1rem] leading-tight shadow-[0_10px_18px_rgba(76,51,33,0.08)]',
              feedback.kind === 'success'
                ? 'border-[#6f9e44]/35 bg-[#f1ffd8] text-[#31521c]'
                : 'border-[#d92d20]/25 bg-[#fff1f0] text-[#b42318]',
            )}
            role={feedback.kind === 'success' ? 'status' : 'alert'}
          >
            {feedback.message}
          </p>
        ) : null}

        {tripsQuery.isLoading ? (
          <TripsWorkspaceState
            title={t('trips.loadingTitle')}
          />
        ) : null}

        {tripsQuery.isError ? (
          <TripsWorkspaceState
            action={(
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d7a957]/30"
                onClick={() => void tripsQuery.refetch()}
                type="button"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2.3} />
                {t('trips.actions.retry')}
              </button>
            )}
            title={t('trips.loadErrorTitle')}
          />
        ) : null}

        {!tripsQuery.isLoading && !tripsQuery.isError && trips.length === 0 ? (
          <TripsWorkspaceState
            action={(
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5"
                to="/app/trips/new"
              >
                <Plus className="h-4 w-4" strokeWidth={2.3} />
                {t('trips.actions.create')}
              </Link>
            )}
            title={t('trips.emptyTitle')}
          />
        ) : null}

        {!tripsQuery.isLoading && !tripsQuery.isError && trips.length > 0 ? (
          <section className="grid gap-5 lg:grid-cols-2">
            {trips.map((trip, index) => (
              <TripWorkspaceCard
                deletingTripId={deletingTripId}
                fallbackCoverImage={fallbackCoverImages[index % fallbackCoverImages.length]}
                formattedUpdatedAt={formatDate(trip.updatedAt)}
                key={trip.id}
                onDelete={() => void handleDeleteTrip(trip)}
                trip={trip}
              />
            ))}
          </section>
        ) : null}
      </div>
    </PublicPageShell>
  );
}

function TripWorkspaceCard({
  deletingTripId,
  fallbackCoverImage,
  formattedUpdatedAt,
  onDelete,
  trip,
}: {
  deletingTripId: string | null;
  fallbackCoverImage: string;
  formattedUpdatedAt: string;
  onDelete: () => void;
  trip: Trip;
}) {
  const { t } = useI18n();
  const tripBudget = formatTripBudget(trip, t);
  const plannerHref = buildPlannerTripPath(trip.id);
  const journalHref = buildJournalTripPath(trip.id);
  const isDeleting = deletingTripId === trip.id;

  return (
    <article className="group overflow-hidden rounded-[1.1rem] border border-[#eadbc5] bg-[#fffdfa] shadow-[0_18px_34px_rgba(76,51,33,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(76,51,33,0.16)]">
      <div className="grid h-full lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="relative min-h-[15rem] overflow-hidden bg-[#f4ead9]">
          <img
            alt={trip.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            src={trip.coverImageUrl || fallbackCoverImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,21,0.05),rgba(43,29,21,0.5))]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 font-marker text-[0.88rem] font-bold leading-none text-[#5f5146] shadow-[0_4px_10px_rgba(69,48,34,0.12)]">
              {t('trips.listCardEyebrow')}
            </span>
            <span className={cn(
              'rounded-full px-3 py-1 font-marker text-[0.88rem] font-bold leading-none shadow-[0_4px_10px_rgba(69,48,34,0.12)]',
              trip.visibility === 'public'
                ? 'bg-[#b9e177] text-[#172612]'
                : 'bg-[#fff1d9] text-[#6b4938]',
            )}
            >
              {t(`trips.visibility.${trip.visibility}`)}
            </span>
          </div>
        </div>

        <div className="flex min-h-full flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="font-cursive text-[1.95rem] leading-tight text-[#2c1f18]">
                {trip.name}
              </h2>
              {trip.destination ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1d9] px-3 py-1.5 font-marker text-[0.98rem] leading-none text-[#6b4938]">
                  <MapPin className="h-4 w-4" strokeWidth={2.3} />
                  {trip.destination}
                </p>
              ) : null}
            </div>

            {trip.visibility === 'public' ? (
              <Link
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#87b95d]/35 bg-[#f1ffd8] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#31521c] transition hover:-translate-y-0.5"
                to={`/public/trips/${encodeURIComponent(trip.id)}`}
              >
                <Globe2 className="h-4 w-4" strokeWidth={2.3} />
                {t('trips.actions.openPublic')}
              </Link>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <TripMetaPill icon={CalendarDays}>
              {formatTripRange(trip.startDate, trip.endDate)}
            </TripMetaPill>
            <TripMetaPill icon={BookOpenText}>
              {tripBudget}
            </TripMetaPill>
          </div>

          <p className="mt-4 text-sm leading-7 text-[#5f5146]">
            {trip.summaryNotes}
          </p>

          <p className="mt-5 text-xs leading-6 text-[#8b7b6e]">
            {t('trips.fields.updatedAt')}: {formattedUpdatedAt}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5"
              to={`/app/trips/${encodeURIComponent(trip.id)}/edit`}
            >
              <PenSquare className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.edit')}
            </Link>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6aa7c7]/30 bg-[#eff9ff] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#24546d] transition hover:-translate-y-0.5"
              to={plannerHref}
            >
              <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.openPlanner')}
            </Link>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#bc956f]/30 bg-[#fff8ea] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5"
              to={journalHref}
            >
              <BookOpenText className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.openJournal')}
            </Link>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
              disabled={Boolean(deletingTripId)}
              onClick={onDelete}
              type="button"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.3} />
              {isDeleting ? t('trips.actions.deleting') : t('trips.actions.delete')}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TripMetaPill({
  children,
  icon: Icon,
}: {
  children: string;
  icon: typeof CalendarDays;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6efe1] px-3 py-1.5 font-marker text-[0.92rem] leading-none text-[#5f5146]">
      <Icon className="h-4 w-4" strokeWidth={2.3} />
      {children}
    </span>
  );
}

function TripsWorkspaceState({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] px-5 py-12 text-center shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:px-8">
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h2 className="mt-2 font-display text-[2rem] leading-tight text-[#2c1f18] sm:text-[2.5rem]">
        {title}
      </h2>
      {description ? (
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5f5146] sm:text-base">
        {description}
      </p>
      ) : null}
      {action ? (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      ) : null}
    </section>
  );
}

function formatTripRange(startDate: string, endDate: string) {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

function formatShortDate(dateInput: string) {
  const date = new Date(`${dateInput.slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

function formatTripBudget(trip: Trip, t: (key: string, values?: Record<string, number | string>) => string) {
  if (trip.budgetMode === 'manual' && trip.manualBudgetAmount !== null && trip.manualBudgetCurrency) {
    return formatMoney(trip.manualBudgetAmount, trip.manualBudgetCurrency);
  }

  if (trip.budgetAmount > 0 && trip.budgetCurrency) {
    return formatMoney(trip.budgetAmount, trip.budgetCurrency);
  }

  return t('trips.budget.autoLabel');
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString('vi-VN')} ${currency}`;
}
