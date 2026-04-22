import { FormEvent, useId, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Compass,
  MapPinned,
  Plane,
  Plus,
  Sparkles,
} from 'lucide-react';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { createTrip, listTrips } from '@/features/trips/api/trips-api';
import type { TripUpsertPayload } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';

const RECENT_TRIPS_QUERY = {
  page: 0,
  size: 6,
  sort: 'startDate,desc' as const,
};

type PlannerCreateFormState = {
  destination: string;
  endDate: string;
  name: string;
  startDate: string;
  summaryNotes: string;
};

const initialFormState: PlannerCreateFormState = {
  destination: '',
  endDate: '',
  name: '',
  startDate: '',
  summaryNotes: '',
};

function buildTripPayload(form: PlannerCreateFormState): TripUpsertPayload {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    budgetMode: 'auto',
    coverImageUrl: null,
    destination: form.destination.trim() || null,
    endDate: form.endDate,
    manualBudgetAmount: null,
    manualBudgetCurrency: null,
    name: form.name.trim(),
    startDate: form.startDate,
    summaryNotes: form.summaryNotes.trim() || null,
    timezone,
    visibility: 'private',
  };
}

export function PlannerPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const createSectionId = useId();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<PlannerCreateFormState>(initialFormState);

  const tripsQuery = useQuery({
    queryFn: ({ signal }) => listTrips(RECENT_TRIPS_QUERY, { signal }),
    queryKey: ['trips', 'list', 'planner-preview', RECENT_TRIPS_QUERY],
  });

  const recentTrips = tripsQuery.data?.data || [];
  const tripCount = tripsQuery.data?.meta.totalElements || 0;

  const checklistItems = useMemo(
    () => [
      t('trips.planner.intro.checklist.flight'),
      t('trips.planner.intro.checklist.photo'),
      t('trips.planner.intro.checklist.budget'),
    ],
    [t],
  );

  const createTripMutation = useMutation({
    mutationFn: (payload: TripUpsertPayload) => createTrip(payload),
    onError: () => {
      setFeedbackMessage(t('trips.planner.feedback.createNodeError'));
    },
    onSuccess: async () => {
      setFeedbackMessage(t('trips.feedback.createSuccess'));
      setFormState(initialFormState);
      setIsCreateOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['trips', 'list', 'planner-preview'] }),
      ]);
    },
  });

  function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage(null);

    if (!formState.name.trim()) {
      setFeedbackMessage(t('trips.validation.nameRequired'));
      return;
    }

    if (!formState.startDate) {
      setFeedbackMessage(t('trips.validation.startDateRequired'));
      return;
    }

    if (!formState.endDate) {
      setFeedbackMessage(t('trips.validation.endDateRequired'));
      return;
    }

    if (formState.endDate < formState.startDate) {
      setFeedbackMessage(t('trips.validation.dateRangeInvalid'));
      return;
    }

    createTripMutation.mutate(buildTripPayload(formState));
  }

  return (
    <PublicPageShell
      mainClassName="w-full px-4 pb-24 pt-2 sm:px-6 lg:px-10"
      mainId="planner-content"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="paper-panel overflow-hidden px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
            <div className="relative space-y-6">
              <div className="space-y-4">
                <p className="section-label">{t('trips.planner.intro.eyebrow')}</p>

                <div className="space-y-3">
                  <h1 className="text-shadow-custom inline-flex max-w-[16ch] flex-col gap-1 font-title text-[2.7rem] leading-[0.88] uppercase tracking-tight text-[#20140e] sm:text-[3.6rem] lg:text-[4.15rem]">
                    <span>{t('trips.planner.intro.titleLine1')}</span>
                    <span className="text-[0.92em]">{t('trips.planner.intro.titleLine2')}</span>
                  </h1>

                  <p className="font-hand text-[2rem] leading-none text-[#5e3d2f] sm:text-[2.4rem]">
                    {t('trips.planner.intro.scriptTitle')}
                  </p>

                  <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
                    {t('trips.planner.intro.description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  className="auth-stamp-button justify-center text-[#9b4a35]"
                  onClick={() => {
                    setIsCreateOpen(true);
                    document.getElementById(createSectionId)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                  type="button"
                >
                  {t('trips.planner.intro.actions.startPlanning')}
                </button>

                <a
                  className="inline-flex items-center justify-center rounded-full border border-[#b98a67]/35 bg-white/72 px-5 py-3 text-sm font-semibold text-[#5f4335] shadow-[0_12px_24px_rgba(96,72,50,0.08)] transition hover:-translate-y-0.5 hover:bg-white"
                  href="#planner-recent-trips"
                >
                  {t('trips.planner.intro.actions.viewRecent')}
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-[1.4rem] border border-[#cfab84]/28 bg-white/75 px-4 py-4 shadow-[0_14px_28px_rgba(96,72,50,0.08)]">
                  <CalendarDays className="h-5 w-5 text-[#c8684f]" />
                  <p className="mt-3 font-hand text-[1.8rem] leading-none text-[#71412e]">
                    {t('trips.planner.intro.stats.daysTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('trips.planner.intro.stats.daysDescription')}
                  </p>
                </article>

                <article className="rounded-[1.4rem] border border-[#cfab84]/28 bg-white/75 px-4 py-4 shadow-[0_14px_28px_rgba(96,72,50,0.08)]">
                  <MapPinned className="h-5 w-5 text-[#5694b4]" />
                  <p className="mt-3 font-hand text-[1.8rem] leading-none text-[#71412e]">
                    {t('trips.planner.intro.stats.stopsTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('trips.planner.intro.stats.stopsDescription')}
                  </p>
                </article>

                <article className="rounded-[1.4rem] border border-[#cfab84]/28 bg-white/75 px-4 py-4 shadow-[0_14px_28px_rgba(96,72,50,0.08)]">
                  <Compass className="h-5 w-5 text-[#9e7a48]" />
                  <p className="mt-3 font-hand text-[1.8rem] leading-none text-[#71412e]">
                    {t('trips.planner.intro.stats.readyTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('trips.planner.intro.stats.readyDescription', {
                      count: tripCount,
                    })}
                  </p>
                </article>
              </div>
            </div>

            <div className="relative min-h-[26rem] sm:min-h-[31rem]">
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_32%),linear-gradient(180deg,rgba(255,250,240,0.98),rgba(245,233,210,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />

              <article className="paper-shadow absolute left-[2%] top-[5%] w-[48%] rotate-[-5deg] rounded-[1.4rem] bg-[#fffdf6] p-4">
                <div className="h-24 rounded-[1rem] bg-[linear-gradient(180deg,rgba(160,211,181,0.56),rgba(121,179,143,0.25)),radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_60%)]" />
                <p className="mt-3 text-center font-marker text-[1.35rem] text-[#2d241d]">
                  {t('trips.planner.intro.cards.destinationOne')}
                </p>
                <p className="text-center font-hand text-[1.6rem] leading-none text-[#5d4336]">
                  {t('trips.planner.intro.cards.destinationOneDate')}
                </p>
              </article>

              <article className="paper-shadow absolute bottom-[10%] left-[14%] w-[34%] rotate-[2deg] rounded-[1.2rem] bg-[#fffdf6] p-3">
                <div className="grid h-24 grid-cols-3 gap-1 rounded-[0.9rem] bg-[#2d241f] p-1.5">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      className="rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,241,175,0.92),transparent_38%),var(--dot-color)]"
                      key={index}
                      style={{
                        ['--dot-color' as string]: [
                          '#d25c4d',
                          '#4b8ac1',
                          '#f1c35d',
                          '#9f5a4c',
                          '#6da487',
                          '#c26b95',
                          '#d98f3e',
                          '#588f8e',
                          '#d34f43',
                        ][index],
                      }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center font-marker text-[1.35rem] text-[#2d241d]">
                  {t('trips.planner.intro.cards.destinationTwo')}
                </p>
                <p className="text-center font-hand text-[1.6rem] leading-none text-[#5d4336]">
                  {t('trips.planner.intro.cards.destinationTwoDate')}
                </p>
              </article>

              <article className="paper-shadow absolute left-[43%] top-[18%] w-[34%] rotate-[4deg] rounded-[1.2rem] bg-[#fffdf6] p-3">
                <div className="h-28 rounded-[0.9rem] bg-[linear-gradient(180deg,rgba(119,191,223,0.72),rgba(226,244,255,0.82)_55%,rgba(99,142,124,0.55)),radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.78),transparent_22%)]" />
                <p className="mt-3 text-center font-marker text-[1.35rem] text-[#2d241d]">
                  {t('trips.planner.intro.cards.destinationThree')}
                </p>
                <p className="text-center font-hand text-[1.6rem] leading-none text-[#5d4336]">
                  {t('trips.planner.intro.cards.destinationThreeDate')}
                </p>
              </article>

              <article className="absolute right-[2%] top-[3%] h-[92%] w-[46%] rounded-[1.7rem] border border-[#d3b690]/28 bg-[linear-gradient(180deg,rgba(254,250,241,0.95),rgba(247,238,219,0.94))] p-4 shadow-[0_20px_34px_rgba(96,72,50,0.1)]">
                <div className="relative h-full overflow-hidden rounded-[1.3rem] border border-[#d7c1a2]/42 bg-[linear-gradient(180deg,#fdfbf5,#f3ead6)] p-4">
                  <div className="absolute right-[12%] top-[12%] h-[72%] w-[42%] rounded-[45%_48%_43%_49%] bg-[#bfe0ec]/75" />
                  <div className="absolute left-[18%] top-[9%] h-[73%] w-[54%] rounded-[48%_44%_52%_41%] border-[3px] border-[#2f241d]" />
                  <div className="absolute left-[27%] top-[18%] h-[43%] w-[25%] rotate-[9deg] rounded-[44%_48%_42%_52%] border-[3px] border-[#2f241d]" />
                  <div className="absolute left-[40%] top-[48%] h-[28%] w-[18%] rotate-[6deg] rounded-[50%_43%_48%_45%] border-[3px] border-[#2f241d]" />

                  <div className="absolute left-[30%] top-[21%] h-4 w-4 rounded-full bg-[#5b93d2] ring-4 ring-white/70" />
                  <div className="absolute left-[45%] top-[48%] h-4 w-4 rounded-full bg-[#d26d58] ring-4 ring-white/70" />
                  <div className="absolute left-[52%] top-[69%] h-4 w-4 rounded-full bg-[#5b93d2] ring-4 ring-white/70" />

                  <div className="absolute right-[16%] top-[18%] h-[54%] w-[32%] rounded-full border-2 border-dashed border-[#42342b]" />
                  <div className="absolute right-[11%] top-[7%]">
                    <Plane className="h-6 w-6 rotate-[12deg] text-[#695347]" />
                  </div>
                  <div className="absolute bottom-[18%] right-[8%]">
                    <Plane className="h-6 w-6 -rotate-[22deg] text-[#695347]" />
                  </div>

                  <div className="absolute left-[2%] top-[32%] max-w-[8.8rem] rotate-[-3deg] rounded-[1rem] border border-[#d7bb7c]/35 bg-[#fff1a6] px-3 py-3 shadow-[0_12px_22px_rgba(96,72,50,0.12)]">
                    <p className="font-hand text-[1.6rem] leading-none text-[#5b3d20]">
                      {t('trips.planner.intro.checklist.title')}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-[#5f4733]">
                      {checklistItems.map((item) => (
                        <li className="flex items-start gap-2" key={item}>
                          <span className="mt-0.5 text-[#6c8b46]">☑</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="absolute right-[3%] top-[22%] flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#c89c4f] bg-[#fff6df] shadow-[0_10px_18px_rgba(96,72,50,0.12)]">
                    <Compass className="h-8 w-8 text-[#5e4437]" />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section
            className="paper-panel px-5 py-6 sm:px-7"
            id={createSectionId}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="section-label">{t('trips.createEyebrow')}</p>
                <div className="space-y-2">
                  <h2 className="font-display text-[2rem] leading-tight text-[#2c1f18] sm:text-[2.4rem]">
                    {t('trips.planner.intro.formTitle')}
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t('trips.planner.intro.formDescription')}
                  </p>
                </div>
              </div>

              <button
                className="rounded-full border border-[#b98a67]/35 bg-white/72 px-4 py-2 text-sm font-semibold text-[#5f4335] transition hover:bg-white"
                onClick={() => setIsCreateOpen((current) => !current)}
                type="button"
              >
                {isCreateOpen
                  ? t('trips.actions.cancel')
                  : t('trips.planner.intro.actions.openForm')}
              </button>
            </div>

            {feedbackMessage ? (
              <div className="mt-5 rounded-[1.2rem] border border-[#d4af8c]/35 bg-white/80 px-4 py-3 text-sm text-[#694837]">
                {feedbackMessage}
              </div>
            ) : null}

            {isCreateOpen ? (
              <form className="mt-6 grid gap-4" onSubmit={handleCreatePlan}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#5e4739]">
                      {t('trips.fields.name')}
                    </span>
                    <input
                      className="rounded-[1rem] border border-[#cfae89]/34 bg-white/88 px-4 py-3 text-sm text-[#2b211c] outline-none transition focus:border-[#b97858] focus:ring-2 focus:ring-[#f2c6b4]"
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        name: event.target.value,
                      }))}
                      value={formState.name}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#5e4739]">
                      {t('trips.fields.destination')}
                    </span>
                    <input
                      className="rounded-[1rem] border border-[#cfae89]/34 bg-white/88 px-4 py-3 text-sm text-[#2b211c] outline-none transition focus:border-[#b97858] focus:ring-2 focus:ring-[#f2c6b4]"
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        destination: event.target.value,
                      }))}
                      value={formState.destination}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#5e4739]">
                      {t('trips.fields.startDate')}
                    </span>
                    <input
                      className="rounded-[1rem] border border-[#cfae89]/34 bg-white/88 px-4 py-3 text-sm text-[#2b211c] outline-none transition focus:border-[#b97858] focus:ring-2 focus:ring-[#f2c6b4]"
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))}
                      type="date"
                      value={formState.startDate}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#5e4739]">
                      {t('trips.fields.endDate')}
                    </span>
                    <input
                      className="rounded-[1rem] border border-[#cfae89]/34 bg-white/88 px-4 py-3 text-sm text-[#2b211c] outline-none transition focus:border-[#b97858] focus:ring-2 focus:ring-[#f2c6b4]"
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))}
                      type="date"
                      value={formState.endDate}
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#5e4739]">
                    {t('trips.fields.summaryNotes')}
                  </span>
                  <textarea
                    className="min-h-28 rounded-[1rem] border border-[#cfae89]/34 bg-white/88 px-4 py-3 text-sm text-[#2b211c] outline-none transition focus:border-[#b97858] focus:ring-2 focus:ring-[#f2c6b4]"
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      summaryNotes: event.target.value,
                    }))}
                    placeholder={t('trips.placeholders.summaryNotes')}
                    value={formState.summaryNotes}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="auth-stamp-button justify-center text-[#9b4a35]"
                    disabled={createTripMutation.isPending}
                    type="submit"
                  >
                    {createTripMutation.isPending
                      ? t('trips.actions.creating')
                      : t('trips.actions.create')}
                  </button>

                  <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('trips.createDescription')}
                  </p>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-[1.4rem] border border-dashed border-[#cfae89]/45 bg-white/56 px-5 py-6">
                <p className="font-hand text-[1.9rem] leading-none text-[#6c4835]">
                  {t('trips.planner.intro.collapsedTitle')}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                  {t('trips.planner.intro.collapsedDescription')}
                </p>
              </div>
            )}
          </section>

          <section
            className="paper-panel px-5 py-6 sm:px-7"
            id="planner-recent-trips"
          >
            <div className="space-y-3">
              <p className="section-label">{t('trips.listEyebrow')}</p>
              <div className="space-y-2">
                <h2 className="font-display text-[2rem] leading-tight text-[#2c1f18] sm:text-[2.4rem]">
                  {t('trips.planner.intro.recentTitle')}
                </h2>
                <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                  {t('trips.planner.intro.recentDescription', { count: tripCount })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {tripsQuery.isLoading ? (
                <article className="rounded-[1.3rem] border border-[#cfab84]/28 bg-white/72 px-4 py-5 text-sm text-[var(--color-ink-soft)]">
                  {t('profile.states.loading')}
                </article>
              ) : null}

              {!tripsQuery.isLoading && tripsQuery.isError ? (
                <article className="rounded-[1.3rem] border border-[#cfab84]/28 bg-white/72 px-4 py-5 text-sm text-[var(--color-ink-soft)]">
                  {t('trips.loadErrorDescription')}
                </article>
              ) : null}

              {!tripsQuery.isLoading && !tripsQuery.isError && recentTrips.length === 0 ? (
                <article className="rounded-[1.3rem] border border-dashed border-[#cfab84]/36 bg-white/66 px-4 py-5">
                  <p className="font-hand text-[1.85rem] leading-none text-[#6c4835]">
                    {t('trips.emptyTitle')}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t('trips.emptyDescription')}
                  </p>
                </article>
              ) : null}

              {!tripsQuery.isLoading && !tripsQuery.isError
                ? recentTrips.map((trip) => (
                    <article
                      className="rounded-[1.4rem] border border-[#cfab84]/28 bg-white/76 px-4 py-4 shadow-[0_14px_26px_rgba(96,72,50,0.08)]"
                      key={trip.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-hand text-[1.9rem] leading-none text-[#704736]">
                            {trip.name}
                          </p>
                          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                            {trip.destination || t('trips.planner.intro.defaultDestination')}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#fff0c8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6a3e]">
                          {trip.visibility}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                        {trip.summaryNotes || t('trips.listCardFallback')}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7a68]">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {trip.startDate} - {trip.endDate}
                        </span>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </section>
        </div>

        <button
          className="auth-stamp-button fixed bottom-5 right-4 z-[70] justify-center text-[#9b4a35] shadow-[0_18px_28px_rgba(96,72,50,0.16)] sm:bottom-7 sm:right-7"
          onClick={() => {
            setIsCreateOpen(true);
            document.getElementById(createSectionId)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t('trips.planner.intro.actions.startPlanning')}</span>
          </span>
        </button>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] h-20 bg-[linear-gradient(180deg,rgba(244,234,214,0),rgba(244,234,214,0.92)_62%,rgba(244,234,214,1))]" />

        <div className="pointer-events-none fixed left-4 top-28 z-10 hidden text-[#c89964]/26 lg:block">
          <Sparkles className="h-12 w-12" />
        </div>
      </div>
    </PublicPageShell>
  );
}
