import { useQuery } from '@tanstack/react-query';
import {
  BookOpenText,
  Home,
  LogIn,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPublicTripJournal } from '@/features/journal/api/journal-api';
import { JournalSceneRenderer } from '@/features/journal/components/journal-scene-renderer';
import { journalQueryKeys } from '@/features/journal/lib/journal-query-keys';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';

export function PublicJournalPage() {
  const { tripId = '' } = useParams<{ tripId: string }>();
  const { t } = useI18n();
  const journalQuery = useQuery({
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => getPublicTripJournal(tripId, { signal }),
    queryKey: journalQueryKeys.publicDetail(tripId),
  });
  const errorStatus =
    journalQuery.error instanceof ApiError ? journalQuery.error.status : null;

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.community}
      mainId="public-journal-content"
      scrollable
    >
      {journalQuery.isLoading ? (
        <PublicJournalState
          description={t('journalPage.publicPage.loadingDescription')}
          title={t('journalPage.publicPage.loadingTitle')}
        />
      ) : null}

      {journalQuery.isError ? (
        <PublicJournalState
          description={
            errorStatus === 403
              ? t('journalPage.publicPage.privateDescription')
              : errorStatus === 404
              ? t('journalPage.publicPage.notFoundDescription')
              : t('journalPage.publicPage.loadErrorDescription')
          }
          title={
            errorStatus === 403
              ? t('journalPage.publicPage.privateTitle')
              : errorStatus === 404
              ? t('journalPage.publicPage.notFoundTitle')
              : t('journalPage.publicPage.loadErrorTitle')
          }
        />
      ) : null}

      {journalQuery.data ? (
        <article className="rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa] p-5 shadow-[0_18px_36px_rgba(76,51,33,0.12)] sm:p-8">
          <header className="mx-auto mb-6 max-w-4xl text-center">
            <p className="section-label">{t('journalPage.publicPage.eyebrow')}</p>
            <h1 className="mt-2 font-cursive text-[2.7rem] font-bold leading-none text-[#251b15] sm:text-[3.6rem]">
              {journalQuery.data.trip.name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f5146]">
              {journalQuery.data.trip.destination || t('journalPage.publicPage.description')}
            </p>
          </header>

          <JournalSceneRenderer
            className="max-w-[min(82vh,52rem)]"
            emptyDescription={t('journalPage.publicPage.emptyDescription')}
            emptyTitle={t('journalPage.publicPage.emptyTitle')}
            journal={journalQuery.data.journal}
          />

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {journalQuery.data.trip.visibility === 'public' ? (
              <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5"
                to={`/public/trips/${encodeURIComponent(journalQuery.data.trip.id)}`}
              >
                <BookOpenText className="h-4 w-4" strokeWidth={2.3} />
                {t('journalPage.publicPage.actions.openPlanner')}
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
              to="/auth/login"
            >
              <LogIn className="h-4 w-4" strokeWidth={2.3} />
              {t('journalPage.publicPage.actions.login')}
            </Link>
          </div>
        </article>
      ) : null}
    </PublicPageShell>
  );
}

function PublicJournalState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-2xl rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa] px-5 py-14 text-center shadow-[0_14px_28px_rgba(76,51,33,0.1)]">
      <h1 className="font-cursive text-[2rem] font-bold leading-none text-[#251b15]">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5f5146]">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5"
          to="/"
        >
          <Home className="h-4 w-4" strokeWidth={2.3} />
          {t('journalPage.publicPage.actions.backHome')}
        </Link>
        <Link
          className="inline-flex items-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
          to="/auth/login"
        >
          <LogIn className="h-4 w-4" strokeWidth={2.3} />
          {t('journalPage.publicPage.actions.login')}
        </Link>
      </div>
    </section>
  );
}
