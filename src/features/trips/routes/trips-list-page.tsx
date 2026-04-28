import { useQuery } from '@tanstack/react-query';
import { CalendarDays, NotebookPen, Plus, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { listTrips } from '@/features/trips/api/trips-api';
import type { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';

const TRIPS_HUB_QUERY = {
  page: 0,
  size: 48,
  sort: 'startDate,desc' as const,
};

const fallbackCoverImages = [
  '/images/defaults/planner-hanoi.svg',
  '/images/defaults/planner-halong.svg',
  '/images/defaults/planner-hoian.svg',
  '/images/defaults/planner-danang.svg',
];

function formatTripRange(trip: Trip) {
  return `${trip.startDate} -> ${trip.endDate}`;
}

function formatTripBudget(trip: Trip, autoLabel: string) {
  if (trip.budgetMode === 'auto') {
    return autoLabel;
  }

  const amount = trip.manualBudgetAmount ?? trip.budgetAmount;
  const currency = trip.manualBudgetCurrency ?? trip.budgetCurrency;

  return `${amount.toLocaleString('vi-VN')} ${currency}`;
}

function TripHubCard({
  index,
  trip,
}: {
  index: number;
  trip: Trip;
}) {
  const { t } = useI18n();
  const coverImageUrl = trip.coverImageUrl || fallbackCoverImages[index % fallbackCoverImages.length];

  return (
    <article className="grid gap-4 overflow-hidden rounded-[1rem] border border-[#d8c5a7] bg-[#fffdf7] p-3 shadow-[0_16px_28px_rgba(92,66,43,0.13)] sm:grid-cols-[11rem_1fr]">
      <div className="relative min-h-44 overflow-hidden rounded-[0.75rem] bg-[#efe2ca]">
        <img
          alt=""
          className="h-full min-h-44 w-full object-cover"
          src={coverImageUrl}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/86 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#6b4938]">
          {t(`trips.visibility.${trip.visibility}`)}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-4 px-1 py-1">
        <div>
          <p className="font-hand text-[1.25rem] font-bold leading-none text-[#9a5c41]">
            {t('trips.listCardEyebrow')}
          </p>
          <h2 className="mt-2 font-display text-[1.75rem] leading-tight text-[#261b15]">
            {trip.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#66594d]">
            {trip.summaryNotes || trip.destination || t('trips.listCardFallback')}
          </p>
        </div>

        <dl className="grid gap-2 text-sm text-[#4d4037] sm:grid-cols-2">
          <div className="rounded-[0.8rem] bg-[#f8edda] px-3 py-2">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8d7f72]">
              {t('trips.fields.dateRange')}
            </dt>
            <dd className="mt-1 font-marker text-[1.15rem]">{formatTripRange(trip)}</dd>
          </div>
          <div className="rounded-[0.8rem] bg-[#f8edda] px-3 py-2">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8d7f72]">
              {t('trips.fields.budget')}
            </dt>
            <dd className="mt-1 font-marker text-[1.15rem]">{formatTripBudget(trip, t('trips.budget.modeAuto'))}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#315c42] bg-[#b9e177] px-4 py-2 text-sm font-bold text-[#172612] shadow-[0_7px_0_#6f9e44] transition hover:-translate-y-0.5"
            to={`/app/trips/${trip.id}/planner`}
          >
            <Route className="h-4 w-4" />
            {t('trips.actions.openPlanner')}
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-4 py-2 text-sm font-bold text-[#6b4938] transition hover:-translate-y-0.5"
            to={`/app/trips/${trip.id}/planner?page=activities`}
          >
            <Plus className="h-4 w-4" />
            {t('trips.actions.addActivity')}
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#6a91a8]/40 bg-[#d8edf7] px-4 py-2 text-sm font-bold text-[#244357] transition hover:-translate-y-0.5"
            to={`/app/trips/${trip.id}/journal`}
          >
            <NotebookPen className="h-4 w-4" />
            {t('trips.actions.openJournal')}
          </Link>
        </div>
      </div>
    </article>
  );
}

function TripsHubState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[1rem] border border-[#d8c5a7] bg-[#fffdf7] px-6 py-10 text-center shadow-[0_16px_28px_rgba(92,66,43,0.1)]">
      <h2 className="font-display text-[2rem] text-[#261b15]">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#66594d]">
        {description}
      </p>
    </section>
  );
}

export function TripsListPage() {
  const { t } = useI18n();
  const tripsQuery = useQuery({
    queryFn: ({ signal }) => listTrips(TRIPS_HUB_QUERY, { signal }),
    queryKey: ['trips', 'list', 'hub', TRIPS_HUB_QUERY],
  });
  const trips = tripsQuery.data?.data || [];

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.trips}
      mainId="trips-content"
      scrollable
    >
      <section className="mb-8 flex flex-col gap-5 rounded-[1rem] border border-[#d8c5a7] bg-[#fff9ee]/90 px-5 py-6 shadow-[0_18px_32px_rgba(92,66,43,0.12)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-label">{t('trips.listEyebrow')}</p>
          <h1 className="mt-3 font-display text-[2.25rem] leading-tight text-[#261b15] sm:text-[3rem]">
            {t('trips.listTitle')}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#66594d] sm:text-base">
            {t('trips.listDescription')}
          </p>
        </div>
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#315c42] bg-[#b9e177] px-5 py-3 font-bold text-[#172612] shadow-[0_8px_0_#6f9e44] transition hover:-translate-y-0.5"
          to="/app/trips/new"
        >
          <Plus className="h-5 w-5" />
          {t('trips.actions.createNewTrip')}
        </Link>
      </section>

      {tripsQuery.isLoading ? (
        <TripsHubState
          description={t('trips.states.loading')}
          title={t('trips.listTitle')}
        />
      ) : null}

      {!tripsQuery.isLoading && tripsQuery.isError ? (
        <TripsHubState
          description={t('trips.loadErrorDescription')}
          title={t('trips.loadErrorTitle')}
        />
      ) : null}

      {!tripsQuery.isLoading && !tripsQuery.isError && trips.length === 0 ? (
        <TripsHubState
          description={t('trips.emptyDescription')}
          title={t('trips.emptyTitle')}
        />
      ) : null}

      {!tripsQuery.isLoading && !tripsQuery.isError && trips.length > 0 ? (
        <div>
          <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#66594d]">
            <CalendarDays className="h-4 w-4" />
            {t('trips.listSummary', { count: tripsQuery.data?.meta.totalElements ?? trips.length })}
          </p>
          <div className="grid gap-5">
            {trips.map((trip, index) => (
              <TripHubCard
                index={index}
                key={trip.id}
                trip={trip}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-10 right-8 hidden rotate-6 text-[#d76355]/35 lg:block">
        <Sparkles className="h-12 w-12" />
      </div>
    </PublicPageShell>
  );
}
