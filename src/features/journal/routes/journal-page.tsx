import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpenText, RefreshCw } from 'lucide-react';
import { getTripJournal } from '@/features/journal/api/journal-api';
import { JournalSceneRenderer } from '@/features/journal/components/journal-scene-renderer';
import { journalQueryKeys } from '@/features/journal/lib/journal-query-keys';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { useI18n } from '@/shared/i18n/use-i18n';

export function JournalPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId')?.trim() ?? '';
  const journalQuery = useQuery({
    queryKey: journalQueryKeys.detail(tripId),
    queryFn: ({ signal }) => getTripJournal(tripId, { signal }),
    enabled: Boolean(tripId),
  });

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.journal}
      mainId="journal-content"
      scrollable
    >
      <div className="mx-auto grid min-h-full w-full max-w-6xl gap-6 py-5 lg:grid-cols-[0.72fr_1fr] lg:items-center lg:py-6">
        <section className="space-y-5">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#bc956f]/35 bg-white/55 px-4 py-2 text-sm font-semibold text-[#6f4a35] shadow-[0_10px_20px_rgba(96,72,50,0.08)] transition hover:bg-white/80"
            to="/app/profile"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t('journalPage.actions.backToProfile')}
          </Link>

          <div className="space-y-3">
            <p className="section-label">{t('journalPage.eyebrow')}</p>
            <h1 className="font-display text-[2.15rem] leading-tight text-[#2c1f18] sm:text-[2.9rem]">
              {resolveJournalTitle()}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
              {resolveJournalDescription()}
            </p>
          </div>

          {journalQuery.data ? (
            <dl className="grid gap-3 text-sm text-[#6a5948] sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="font-semibold text-[#4f382c]">
                  {t('journalPage.meta.trip')}
                </dt>
                <dd>{journalQuery.data.trip.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#4f382c]">
                  {t('journalPage.meta.updatedAt')}
                </dt>
                <dd>{formatDisplayDate(journalQuery.data.journal.updatedAt)}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="min-h-[26rem]">
          {renderJournalSurface()}
        </section>
      </div>
    </PublicPageShell>
  );

  function resolveJournalTitle() {
    if (journalQuery.data) {
      return journalQuery.data.trip.name;
    }

    if (!tripId) {
      return t('journalPage.missingTripTitle');
    }

    return t('journalPage.title');
  }

  function resolveJournalDescription() {
    if (journalQuery.data) {
      return formatTripSummary(journalQuery.data.trip.destination, journalQuery.data.trip.startDate, journalQuery.data.trip.endDate);
    }

    if (!tripId) {
      return t('journalPage.missingTripDescription');
    }

    if (journalQuery.isError) {
      return t('journalPage.errorDescription');
    }

    return t('journalPage.description');
  }

  function renderJournalSurface() {
    if (!tripId) {
      return (
        <StatusPanel
          icon={<BookOpenText aria-hidden="true" className="h-8 w-8" />}
          title={t('journalPage.missingTripTitle')}
          description={t('journalPage.missingTripDescription')}
        />
      );
    }

    if (journalQuery.isLoading) {
      return (
        <StatusPanel
          icon={<RefreshCw aria-hidden="true" className="h-8 w-8 animate-spin" />}
          title={t('journalPage.loadingTitle')}
          description={t('journalPage.loadingDescription')}
        />
      );
    }

    if (journalQuery.isError || !journalQuery.data) {
      return (
        <StatusPanel
          icon={<BookOpenText aria-hidden="true" className="h-8 w-8" />}
          title={t('journalPage.errorTitle')}
          description={t('journalPage.errorDescription')}
        />
      );
    }

    return (
      <JournalSceneRenderer
        emptyDescription={t('journalPage.emptyDescription')}
        emptyTitle={t('journalPage.emptyTitle')}
        journal={journalQuery.data.journal}
      />
    );
  }
}

function StatusPanel({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-[26rem] w-full items-center justify-center rounded-[1.5rem] border border-[#bc956f]/26 bg-white/55 px-6 py-8 text-center shadow-[0_18px_32px_rgba(96,72,50,0.08)]">
      <div className="max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4c7] text-[#8a573b]">
          {icon}
        </div>
        <h2 className="mt-5 font-display text-[1.8rem] leading-tight text-[#2c1f18]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function formatTripSummary(
  destination: string | null,
  startDate: string,
  endDate: string,
) {
  const dateRange = `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;

  return destination ? `${destination} · ${dateRange}` : dateRange;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
