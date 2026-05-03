import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpenText,
  Image,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  getTripJournal,
  saveTripJournal,
} from '@/features/journal/api/journal-api';
import { JournalSceneRenderer } from '@/features/journal/components/journal-scene-renderer';
import { journalQueryKeys } from '@/features/journal/lib/journal-query-keys';
import type {
  JournalObjectType,
  JournalSceneObject,
  TripJournal,
  TripJournalResult,
} from '@/features/journal/types/journal';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { listTrips } from '@/features/trips/api/trips-api';
import type { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';

const JOURNAL_TRIP_PICKER_QUERY = {
  page: 0,
  size: 100,
  sort: 'startDate,desc' as const,
};

export function JournalPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId')?.trim() ?? '';
  const [draftJournal, setDraftJournal] = useState<TripJournal | null>(null);
  const [noteText, setNoteText] = useState(t('journalPage.editor.defaultNote'));
  const [imageUrl, setImageUrl] = useState('');
  const [stickerLabel, setStickerLabel] = useState(t('journalPage.editor.defaultSticker'));
  const journalQuery = useQuery({
    queryKey: journalQueryKeys.detail(tripId),
    queryFn: ({ signal }) => getTripJournal(tripId, { signal }),
    enabled: Boolean(tripId),
  });
  const tripsQuery = useQuery({
    queryKey: ['trips', 'list', 'journal-picker', JOURNAL_TRIP_PICKER_QUERY],
    queryFn: ({ signal }) => listTrips(JOURNAL_TRIP_PICKER_QUERY, { signal }),
    enabled: !tripId,
  });
  const activeJournal = draftJournal ?? journalQuery.data?.journal ?? null;
  const saveJournalMutation = useMutation({
    mutationFn: async () => {
      if (!activeJournal) {
        throw new Error('Journal is not loaded.');
      }

      return saveTripJournal(tripId, {
        sceneVersion: activeJournal.sceneVersion,
        page: activeJournal.page,
        objects: activeJournal.objects,
      });
    },
    onSuccess: (result) => {
      setDraftJournal(result.journal);
      queryClient.setQueryData<TripJournalResult>(
        journalQueryKeys.detail(tripId),
        result,
      );
    },
  });

  useEffect(() => {
    if (journalQuery.data?.journal) {
      setDraftJournal(journalQuery.data.journal);
    }
  }, [journalQuery.data?.journal, tripId]);

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

          {activeJournal ? renderEditorPanel(activeJournal) : null}
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
      return t('journalPage.pickerTitle');
    }

    return t('journalPage.title');
  }

  function resolveJournalDescription() {
    if (journalQuery.data) {
      return formatTripSummary(journalQuery.data.trip.destination, journalQuery.data.trip.startDate, journalQuery.data.trip.endDate);
    }

    if (!tripId) {
      return t('journalPage.pickerDescription');
    }

    if (journalQuery.isError) {
      return t('journalPage.errorDescription');
    }

    return t('journalPage.description');
  }

  function renderJournalSurface() {
    if (!tripId) {
      return (
        <JournalTripPicker
          errorDescription={t('journalPage.pickerErrorDescription')}
          errorTitle={t('journalPage.pickerErrorTitle')}
          emptyDescription={t('journalPage.pickerEmptyDescription')}
          emptyTitle={t('journalPage.pickerEmptyTitle')}
          createTripLabel={t('journalPage.pickerCreateTrip')}
          loadingDescription={t('journalPage.pickerLoadingDescription')}
          loadingTitle={t('journalPage.pickerLoadingTitle')}
          trips={tripsQuery.data?.data ?? []}
          isError={tripsQuery.isError}
          isLoading={tripsQuery.isLoading}
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

    if (journalQuery.isError || !journalQuery.data || !activeJournal) {
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
        journal={activeJournal}
      />
    );
  }

  function renderEditorPanel(journal: TripJournal) {
    return (
      <div className="rounded-[1.1rem] border border-[#d7b88f]/40 bg-white/55 p-4 shadow-[0_14px_24px_rgba(96,72,50,0.08)]">
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
              {t('journalPage.editor.noteLabel')}
            </span>
            <textarea
              className="min-h-20 resize-none rounded-[0.75rem] border border-dashed border-[#c9a77e]/60 bg-[#fffaf0] px-3 py-2 font-marker text-[1.05rem] leading-tight text-[#3d332b] outline-none focus:bg-white focus:ring-2 focus:ring-[#d7a957]/25"
              maxLength={240}
              onChange={(event) => setNoteText(event.target.value)}
              value={noteText}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#a8563f]/30 bg-[#ffe3d7] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#7b3526] shadow-[0_5px_0_#dda08c] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!noteText.trim()}
            onClick={() => addJournalObject('note', journal)}
            type="button"
          >
            <BookOpenText aria-hidden="true" className="h-4 w-4" />
            {t('journalPage.editor.addNote')}
          </button>

          <label className="grid gap-1.5">
            <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
              {t('journalPage.editor.imageLabel')}
            </span>
            <input
              className="rounded-[0.75rem] border border-dashed border-[#c9a77e]/60 bg-[#fffaf0] px-3 py-2 font-marker text-[1.05rem] text-[#3d332b] outline-none focus:bg-white focus:ring-2 focus:ring-[#d7a957]/25"
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
              type="url"
              value={imageUrl}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#407456]/30 bg-[#dff2dc] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#27513b] shadow-[0_5px_0_#9dcc94] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!imageUrl.trim()}
            onClick={() => addJournalObject('photo', journal)}
            type="button"
          >
            <Image aria-hidden="true" className="h-4 w-4" />
            {t('journalPage.editor.addPhoto')}
          </button>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end lg:grid-cols-1">
            <label className="grid gap-1.5">
              <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
                {t('journalPage.editor.stickerLabel')}
              </span>
              <input
                className="rounded-[0.75rem] border border-dashed border-[#c9a77e]/60 bg-[#fffaf0] px-3 py-2 font-marker text-[1.05rem] text-[#3d332b] outline-none focus:bg-white focus:ring-2 focus:ring-[#d7a957]/25"
                maxLength={24}
                onChange={(event) => setStickerLabel(event.target.value)}
                value={stickerLabel}
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7d5c9e]/25 bg-[#eadcff] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#594077] shadow-[0_5px_0_#b7a1df] transition hover:-translate-y-0.5"
              onClick={() => addJournalObject('sticker', journal)}
              type="button"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t('journalPage.editor.addSticker')}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[#a57a2e]/25 bg-[#ffe4a8] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
              onClick={() => addJournalObject('tape', journal)}
              type="button"
            >
              {t('journalPage.editor.addTape')}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#2f5d34]/30 bg-[#b9e177] px-5 py-2.5 font-marker text-[1.02rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saveJournalMutation.isPending}
            onClick={() => saveJournalMutation.mutate()}
            type="button"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {saveJournalMutation.isPending
              ? t('journalPage.editor.saving')
              : t('journalPage.editor.save')}
          </button>
          <span className="font-marker text-[1rem] leading-none text-[#6b4938]">
            {t('journalPage.editor.objectCount', {
              count: journal.objects.length,
            })}
          </span>
        </div>

        {saveJournalMutation.isSuccess ? (
          <p className="mt-3 font-marker text-[1rem] leading-tight text-[#31521c]" role="status">
            {t('journalPage.editor.saveSuccess')}
          </p>
        ) : null}
        {saveJournalMutation.isError ? (
          <p className="mt-3 font-marker text-[1rem] leading-tight text-[#b42318]" role="alert">
            {t('journalPage.editor.saveError')}
          </p>
        ) : null}
      </div>
    );
  }

  function addJournalObject(type: JournalObjectType, journal: TripJournal) {
    saveJournalMutation.reset();
    setDraftJournal({
      ...journal,
      objects: [...journal.objects, createJournalObject(type, journal)],
      updatedAt: new Date().toISOString(),
    });

    if (type === 'note') {
      setNoteText('');
    }

    if (type === 'photo') {
      setImageUrl('');
    }
  }

  function createJournalObject(
    type: JournalObjectType,
    journal: TripJournal,
  ): JournalSceneObject {
    const nextIndex = journal.objects.length;
    const baseObject = buildJournalObjectBase(type, nextIndex, journal);

    if (type === 'photo') {
      return {
        ...baseObject,
        width: 360,
        height: 300,
        props: {
          imageUrl: imageUrl.trim(),
          alt: journalQuery.data?.trip.name ?? '',
        },
      };
    }

    if (type === 'sticker') {
      return {
        ...baseObject,
        width: 150,
        height: 150,
        props: {
          color: '#f2a088',
          label: stickerLabel.trim() || t('journalPage.editor.defaultSticker'),
        },
      };
    }

    if (type === 'tape') {
      return {
        ...baseObject,
        width: 260,
        height: 64,
        rotation: -8,
        props: {
          color: '#f2cc6f',
        },
      };
    }

    return {
      ...baseObject,
      width: 360,
      height: 220,
      props: {
        color: '#fff4c7',
        text: noteText.trim(),
      },
    };
  }
}

function JournalTripPicker({
  createTripLabel,
  emptyDescription,
  emptyTitle,
  errorDescription,
  errorTitle,
  isError,
  isLoading,
  loadingDescription,
  loadingTitle,
  trips,
}: {
  createTripLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  errorDescription: string;
  errorTitle: string;
  isError: boolean;
  isLoading: boolean;
  loadingDescription: string;
  loadingTitle: string;
  trips: Trip[];
}) {
  if (isLoading) {
    return (
      <StatusPanel
        icon={<RefreshCw aria-hidden="true" className="h-8 w-8 animate-spin" />}
        title={loadingTitle}
        description={loadingDescription}
      />
    );
  }

  if (isError) {
    return (
      <StatusPanel
        icon={<BookOpenText aria-hidden="true" className="h-8 w-8" />}
        title={errorTitle}
        description={errorDescription}
      />
    );
  }

  if (trips.length === 0) {
    return (
      <StatusPanel
        icon={<BookOpenText aria-hidden="true" className="h-8 w-8" />}
        title={emptyTitle}
        description={emptyDescription}
      >
        <Link
          className="mt-5 inline-flex rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-5 py-2.5 font-marker text-[1.05rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5"
          to="/app/planner"
        >
          {createTripLabel}
        </Link>
      </StatusPanel>
    );
  }

  return (
    <div className="grid gap-3">
      {trips.map((trip) => (
        <Link
          className="group grid gap-2 rounded-[1.1rem] border border-[#d7b88f]/45 bg-white/65 p-4 shadow-[0_14px_24px_rgba(96,72,50,0.1)] transition hover:-translate-y-0.5 hover:bg-white"
          key={trip.id}
          to={`/app/journal?tripId=${encodeURIComponent(trip.id)}`}
        >
          <span className="font-display text-[1.45rem] leading-tight text-[#2c1f18]">
            {trip.name}
          </span>
          <span className="font-marker text-[1rem] leading-tight text-[#6b4938]">
            {formatTripSummary(trip.destination, trip.startDate, trip.endDate)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function StatusPanel({
  children,
  description,
  icon,
  title,
}: {
  children?: ReactNode;
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
        {children}
      </div>
    </div>
  );
}

function buildJournalObjectBase(
  type: JournalObjectType,
  index: number,
  journal: TripJournal,
): JournalSceneObject {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const maxX = Math.max(0, journal.page.width - 460);
  const maxY = Math.max(0, journal.page.height - 360);

  return {
    id: createJournalObjectId(type),
    type,
    x: Math.min(maxX, 120 + column * 230),
    y: Math.min(maxY, 170 + row * 210),
    width: 320,
    height: 220,
    rotation: column === 1 ? 4 : -4,
    zIndex: resolveNextZIndex(journal.objects),
    locked: false,
    props: {},
  };
}

function resolveNextZIndex(objects: JournalSceneObject[]) {
  return objects.reduce((max, object) => Math.max(max, object.zIndex), 0) + 1;
}

function createJournalObjectId(type: JournalObjectType) {
  return `${type}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
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
