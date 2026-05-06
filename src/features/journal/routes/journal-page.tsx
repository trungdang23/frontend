import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpenText,
  Image,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  deleteTripJournalAsset,
  getTripJournal,
  listTripJournalAssets,
  saveTripJournal,
  uploadTripJournalAsset,
} from "@/features/journal/api/journal-api";
import { JournalSceneRenderer } from "@/features/journal/components/journal-scene-renderer";
import {
  areJournalObjectListsEqual,
  areJournalScenesEqual,
  canMoveObjectLayer,
  type JournalLayerDirection,
  moveObjectLayer,
  normalizeRotation,
  serializeJournalScene,
  shouldAutosaveJournalScene,
  shouldReplaceDraftWithSavedScene,
} from "@/features/journal/lib/journal-scene-editing";
import { journalQueryKeys } from "@/features/journal/lib/journal-query-keys";
import { useJournalExitGuard } from "@/features/journal/lib/use-journal-exit-guard";
import type {
  JournalObjectType,
  JournalSceneObject,
  TripJournalAsset,
  TripJournal,
  TripJournalResult,
} from "@/features/journal/types/journal";
import { PublicPageShell } from "@/features/shell/components/public-page-shell";
import { publicPageMainLayouts } from "@/features/shell/content/public-page-layouts";
import { useI18n } from "@/shared/i18n/use-i18n";

const JOURNAL_AUTOSAVE_DELAY_MS = 1500;

type JournalSaveReason = "autosave" | "manual";

export function JournalPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { tripId: routeTripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();
  const tripId =
    routeTripId?.trim() || searchParams.get("tripId")?.trim() || "";
  const [draftJournal, setDraftJournal] = useState<TripJournal | null>(null);
  const [noteText, setNoteText] = useState(t("journalPage.editor.defaultNote"));
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [stickerLabel, setStickerLabel] = useState(
    t("journalPage.editor.defaultSticker"),
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const journalQuery = useQuery({
    queryKey: journalQueryKeys.detail(tripId),
    queryFn: ({ signal }) => getTripJournal(tripId, { signal }),
    enabled: Boolean(tripId),
  });
  const journalAssetsQuery = useQuery({
    queryKey: journalQueryKeys.assets(tripId),
    queryFn: ({ signal }) => listTripJournalAssets(tripId, { signal }),
    enabled: Boolean(tripId),
  });
  const activeJournal = draftJournal ?? journalQuery.data?.journal ?? null;
  const savedJournal = journalQuery.data?.journal ?? null;
  const selectedObject =
    activeJournal?.objects.find((object) => object.id === selectedObjectId) ??
    null;
  const isDirty = activeJournal
    ? !areJournalScenesEqual(activeJournal, savedJournal)
    : false;
  const lastCompletedSaveReasonRef = useRef<JournalSaveReason | null>(null);
  const lastAutosaveFingerprintRef = useRef<string | null>(null);
  const activeSceneFingerprint = activeJournal
    ? serializeJournalScene(activeJournal)
    : null;
  const saveJournalMutation = useMutation({
    mutationFn: async ({
      fingerprint,
      journal,
      reason,
    }: {
      fingerprint: string;
      journal: TripJournal;
      reason: JournalSaveReason;
    }) => {
      return saveTripJournal(tripId, {
        sceneVersion: journal.sceneVersion,
        page: journal.page,
        objects: journal.objects,
      });
    },
    onSuccess: (result, variables) => {
      lastCompletedSaveReasonRef.current = variables.reason;
      setDraftJournal((currentDraft) => {
        if (
          !shouldReplaceDraftWithSavedScene(currentDraft, variables.fingerprint)
        ) {
          return currentDraft;
        }

        return result.journal;
      });
      queryClient.setQueryData<TripJournalResult>(
        journalQueryKeys.detail(tripId),
        result,
      );
      void queryClient.invalidateQueries({
        queryKey: journalQueryKeys.mine(),
      });
    },
  });
  const uploadJournalAssetMutation = useMutation({
    mutationFn: async (file: File) => uploadTripJournalAsset(tripId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: journalQueryKeys.assets(tripId),
      });
    },
  });
  const deleteJournalAssetMutation = useMutation({
    mutationFn: async (assetId: string) =>
      deleteTripJournalAsset(tripId, assetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: journalQueryKeys.assets(tripId),
      });
    },
  });
  const mutateJournalSave = saveJournalMutation.mutate;

  useEffect(() => {
    if (journalQuery.data?.journal) {
      setDraftJournal(journalQuery.data.journal);
    }
  }, [journalQuery.data?.journal, tripId]);

  useEffect(() => {
    if (
      activeJournal &&
      selectedObjectId &&
      !activeJournal.objects.some((object) => object.id === selectedObjectId)
    ) {
      setSelectedObjectId(null);
    }
  }, [activeJournal, selectedObjectId]);

  useEffect(() => {
    if (
      !shouldAutosaveJournalScene({
        activeFingerprint: activeSceneFingerprint,
        isDirty,
        isPending: saveJournalMutation.isPending,
        lastAutosaveFingerprint: lastAutosaveFingerprintRef.current,
      })
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (!activeJournal) {
        return;
      }

      lastAutosaveFingerprintRef.current = activeSceneFingerprint;
      mutateJournalSave({
        fingerprint: activeSceneFingerprint!,
        journal: activeJournal,
        reason: "autosave",
      });
    }, JOURNAL_AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeJournal,
    activeSceneFingerprint,
    isDirty,
    mutateJournalSave,
    saveJournalMutation.isPending,
  ]);

  useJournalExitGuard({
    message: t("journalPage.editor.leaveConfirm"),
    when: isDirty || saveJournalMutation.isPending,
  });

  if (!tripId) {
    return <Navigate replace to="/app/profile" />;
  }

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
            {t("journalPage.actions.backToProfile")}
          </Link>

          <div className="space-y-3">
            <p className="section-label">{t("journalPage.eyebrow")}</p>
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
                  {t("journalPage.meta.trip")}
                </dt>
                <dd>{journalQuery.data.trip.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#4f382c]">
                  {t("journalPage.meta.updatedAt")}
                </dt>
                <dd>
                  {formatDisplayDate(journalQuery.data.journal.updatedAt)}
                </dd>
              </div>
            </dl>
          ) : null}

          {activeJournal ? renderEditorPanel(activeJournal) : null}
        </section>

        <section className="min-h-[26rem]">{renderJournalSurface()}</section>
      </div>
    </PublicPageShell>
  );

  function resolveJournalTitle() {
    if (journalQuery.data) {
      return journalQuery.data.trip.name;
    }

    return t("journalPage.title");
  }

  function resolveJournalDescription() {
    if (journalQuery.data) {
      return formatTripSummary(
        journalQuery.data.trip.destination,
        journalQuery.data.trip.startDate,
        journalQuery.data.trip.endDate,
      );
    }

    if (journalQuery.isError) {
      return t("journalPage.errorDescription");
    }

    return t("journalPage.description");
  }

  function resolveSaveStatusLabel() {
    if (saveJournalMutation.isPending) {
      return saveJournalMutation.variables?.reason === "autosave"
        ? t("journalPage.editor.autosaving")
        : t("journalPage.editor.saving");
    }

    if (isDirty) {
      return t("journalPage.editor.unsavedChanges");
    }

    return lastCompletedSaveReasonRef.current === "autosave"
      ? t("journalPage.editor.autosavedState")
      : t("journalPage.editor.savedState");
  }

  function renderJournalSurface() {
    if (journalQuery.isLoading) {
      return (
        <StatusPanel
          icon={
            <RefreshCw aria-hidden="true" className="h-8 w-8 animate-spin" />
          }
          title={t("journalPage.loadingTitle")}
          description={t("journalPage.loadingDescription")}
        />
      );
    }

    if (journalQuery.isError || !journalQuery.data || !activeJournal) {
      return (
        <StatusPanel
          icon={<BookOpenText aria-hidden="true" className="h-8 w-8" />}
          title={t("journalPage.errorTitle")}
          description={t("journalPage.errorDescription")}
        />
      );
    }

    return (
      <JournalSceneRenderer
        editable
        emptyDescription={t("journalPage.emptyDescription")}
        emptyTitle={t("journalPage.emptyTitle")}
        interactiveObjectLabel={t("journalPage.editor.objectControlLabel")}
        journal={activeJournal}
        onObjectMove={moveJournalObject}
        onObjectResize={resizeJournalObjectOnPage}
        onObjectSelect={setSelectedObjectId}
        resizeHandleLabel={t("journalPage.editor.resizeObject")}
        selectedObjectId={selectedObjectId}
      />
    );
  }

  function renderEditorPanel(journal: TripJournal) {
    return (
      <div className="rounded-[1.1rem] border border-[#d7b88f]/40 bg-white/55 p-4 shadow-[0_14px_24px_rgba(96,72,50,0.08)]">
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
              {t("journalPage.editor.noteLabel")}
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
            onClick={() => addJournalObject("note", journal)}
            type="button"
          >
            <BookOpenText aria-hidden="true" className="h-4 w-4" />
            {t("journalPage.editor.addNote")}
          </button>

          <label className="grid gap-1.5">
            <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
              {t("journalPage.editor.imageLabel")}
            </span>
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              className="rounded-[0.75rem] border border-dashed border-[#c9a77e]/60 bg-[#fffaf0] px-3 py-2 font-marker text-[1rem] text-[#3d332b] file:mr-3 file:rounded-full file:border-0 file:bg-[#dff2dc] file:px-3 file:py-1.5 file:font-marker file:font-bold file:text-[#27513b] focus:bg-white focus:ring-2 focus:ring-[#d7a957]/25"
              onChange={(event) => {
                uploadJournalAssetMutation.reset();
                setSelectedImageFile(event.target.files?.[0] ?? null);
              }}
              ref={imageFileInputRef}
              type="file"
            />
            <span className="text-xs font-medium text-[#8a6d51]">
              {t("journalPage.editor.imageHelp")}
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
            disabled={
              uploadJournalAssetMutation.isPending ||
              (!selectedImageFile && !imageUrl.trim())
            }
            onClick={() => {
              void addPhotoObject(journal);
            }}
            type="button"
          >
            <Image aria-hidden="true" className="h-4 w-4" />
            {uploadJournalAssetMutation.isPending
              ? t("journalPage.editor.uploadingPhoto")
              : t("journalPage.editor.addPhoto")}
          </button>
          {uploadJournalAssetMutation.isError ? (
            <p
              className="font-marker text-[1rem] leading-tight text-[#b42318]"
              role="alert"
            >
              {t("journalPage.editor.uploadPhotoError")}
            </p>
          ) : null}

          {renderAssetLibrary(journal)}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end lg:grid-cols-1">
            <label className="grid gap-1.5">
              <span className="font-marker text-[1.05rem] font-bold leading-none text-[#6b4938]">
                {t("journalPage.editor.stickerLabel")}
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
              onClick={() => addJournalObject("sticker", journal)}
              type="button"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t("journalPage.editor.addSticker")}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[#a57a2e]/25 bg-[#ffe4a8] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
              onClick={() => addJournalObject("tape", journal)}
              type="button"
            >
              {t("journalPage.editor.addTape")}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[0.95rem] border border-[#d7b88f]/35 bg-[#fffaf0]/75 p-3">
          {selectedObject ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-marker text-[1.02rem] font-bold leading-none text-[#4f382c]">
                    {t("journalPage.editor.selectionTitle")}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6d51]">
                    {t(`journalPage.editor.objectTypes.${selectedObject.type}`)}
                  </p>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 font-marker text-[0.9rem] leading-none text-[#6b4938]">
                  {t("journalPage.editor.objectPosition", {
                    x: Math.round(selectedObject.x),
                    y: Math.round(selectedObject.y),
                  })}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2">
                <button
                  aria-label={t("journalPage.editor.sendBackward")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#8b6244]/25 bg-white/70 px-3 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    !canMoveObjectLayer(
                      journal.objects,
                      selectedObject.id,
                      "backward",
                    )
                  }
                  onClick={() => moveSelectedObjectLayer("backward")}
                  title={t("journalPage.editor.sendBackward")}
                  type="button"
                >
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                  {t("journalPage.editor.sendBackwardShort")}
                </button>
                <button
                  aria-label={t("journalPage.editor.bringForward")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#8b6244]/25 bg-white/70 px-3 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    !canMoveObjectLayer(
                      journal.objects,
                      selectedObject.id,
                      "forward",
                    )
                  }
                  onClick={() => moveSelectedObjectLayer("forward")}
                  title={t("journalPage.editor.bringForward")}
                  type="button"
                >
                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                  {t("journalPage.editor.bringForwardShort")}
                </button>
                <button
                  aria-label={t("journalPage.editor.rotateLeft")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#407456]/25 bg-[#eff9e8] px-3 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#27513b] transition hover:-translate-y-0.5"
                  onClick={() => rotateSelectedObject(-8)}
                  title={t("journalPage.editor.rotateLeft")}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  {t("journalPage.editor.rotateLeftShort")}
                </button>
                <button
                  aria-label={t("journalPage.editor.rotateRight")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#407456]/25 bg-[#eff9e8] px-3 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#27513b] transition hover:-translate-y-0.5"
                  onClick={() => rotateSelectedObject(8)}
                  title={t("journalPage.editor.rotateRight")}
                  type="button"
                >
                  <RotateCw aria-hidden="true" className="h-4 w-4" />
                  {t("journalPage.editor.rotateRightShort")}
                </button>
                <button
                  aria-label={t("journalPage.editor.deleteObject")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-3 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 sm:col-span-1 lg:col-span-2"
                  onClick={deleteSelectedObject}
                  title={t("journalPage.editor.deleteObject")}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  {t("journalPage.editor.deleteObjectShort")}
                </button>
              </div>
            </>
          ) : (
            <p className="font-marker text-[1rem] leading-tight text-[#6b4938]">
              {t("journalPage.editor.noSelection")}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#2f5d34]/30 bg-[#b9e177] px-5 py-2.5 font-marker text-[1.02rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saveJournalMutation.isPending || !isDirty}
            onClick={() => {
              if (!activeJournal) {
                return;
              }

              mutateJournalSave({
                fingerprint: serializeJournalScene(activeJournal),
                journal: activeJournal,
                reason: "manual",
              });
            }}
            type="button"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {saveJournalMutation.isPending
              ? saveJournalMutation.variables?.reason === "autosave"
                ? t("journalPage.editor.autosaving")
                : t("journalPage.editor.saving")
              : t("journalPage.editor.save")}
          </button>
          <span className="font-marker text-[1rem] leading-none text-[#6b4938]">
            {t("journalPage.editor.objectCount", {
              count: journal.objects.length,
            })}
          </span>
          <span
            className="font-marker text-[1rem] leading-none text-[#6b4938]"
            role="status"
          >
            {resolveSaveStatusLabel()}
          </span>
        </div>

        {saveJournalMutation.isSuccess &&
        !isDirty &&
        saveJournalMutation.variables?.reason === "manual" ? (
          <p
            className="mt-3 font-marker text-[1rem] leading-tight text-[#31521c]"
            role="status"
          >
            {t("journalPage.editor.saveSuccess")}
          </p>
        ) : null}
        {saveJournalMutation.isError ? (
          <p
            className="mt-3 font-marker text-[1rem] leading-tight text-[#b42318]"
            role="alert"
          >
            {t("journalPage.editor.saveError")}
          </p>
        ) : null}
      </div>
    );
  }

  function renderAssetLibrary(journal: TripJournal) {
    const assets = journalAssetsQuery.data?.assets ?? [];

    return (
      <section className="rounded-[0.95rem] border border-[#d7b88f]/35 bg-[#fffaf0]/75 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-marker text-[1.02rem] font-bold leading-none text-[#4f382c]">
              {t("journalPage.editor.assetLibraryTitle")}
            </h2>
            <p className="mt-1 text-xs font-medium text-[#8a6d51]">
              {t("journalPage.editor.assetLibraryDescription")}
            </p>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 font-marker text-[0.9rem] leading-none text-[#6b4938]">
            {t("journalPage.editor.assetCount", { count: assets.length })}
          </span>
        </div>

        {journalAssetsQuery.isLoading ? (
          <p className="mt-3 font-marker text-[1rem] leading-tight text-[#6b4938]">
            {t("journalPage.editor.assetLibraryLoading")}
          </p>
        ) : null}

        {journalAssetsQuery.isError ? (
          <p
            className="mt-3 font-marker text-[1rem] leading-tight text-[#b42318]"
            role="alert"
          >
            {t("journalPage.editor.assetLibraryError")}
          </p>
        ) : null}

        {!journalAssetsQuery.isLoading &&
        !journalAssetsQuery.isError &&
        assets.length === 0 ? (
          <p className="mt-3 font-marker text-[1rem] leading-tight text-[#6b4938]">
            {t("journalPage.editor.assetLibraryEmpty")}
          </p>
        ) : null}

        {assets.length > 0 ? (
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
            {assets.map((asset) => {
              const assetId = asset.id ?? "";
              const isUsed =
                isAssetUsedInJournal(asset, journal) ||
                (savedJournal
                  ? isAssetUsedInJournal(asset, savedJournal)
                  : false);
              const isDeleting =
                deleteJournalAssetMutation.isPending &&
                deleteJournalAssetMutation.variables === assetId;

              return (
                <article
                  className="grid grid-cols-[4.5rem_1fr] gap-2 rounded-[0.8rem] border border-[#d7b88f]/35 bg-white/60 p-2"
                  key={asset.url}
                >
                  <img
                    alt={asset.fileName}
                    className="h-20 w-full rounded-[0.55rem] object-cover"
                    loading="lazy"
                    src={asset.url}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-marker text-[0.95rem] font-bold leading-tight text-[#4f382c]">
                      {asset.fileName}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#8a6d51]">
                      {formatAssetByteSize(asset.byteSize)}
                    </p>
                    {isUsed ? (
                      <p className="mt-1 text-xs font-semibold text-[#7b5b2d]">
                        {t("journalPage.editor.assetInUse")}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        className="inline-flex items-center gap-1 rounded-full border border-[#407456]/25 bg-[#eff9e8] px-2.5 py-1.5 font-marker text-[0.85rem] font-bold leading-none text-[#27513b] transition hover:-translate-y-0.5"
                        onClick={() => addAssetPhotoObject(journal, asset)}
                        type="button"
                      >
                        <Image aria-hidden="true" className="h-3.5 w-3.5" />
                        {t("journalPage.editor.addAssetPhoto")}
                      </button>
                      <button
                        aria-label={t("journalPage.editor.deleteAsset")}
                        className="inline-flex items-center gap-1 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-2.5 py-1.5 font-marker text-[0.85rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={!assetId || isUsed || isDeleting}
                        onClick={() => deleteAsset(asset, journal)}
                        title={
                          isUsed
                            ? t("journalPage.editor.deleteAssetInUse")
                            : t("journalPage.editor.deleteAsset")
                        }
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        {isDeleting
                          ? t("journalPage.editor.deletingAsset")
                          : t("journalPage.editor.deleteAssetShort")}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {deleteJournalAssetMutation.isError ? (
          <p
            className="mt-3 font-marker text-[1rem] leading-tight text-[#b42318]"
            role="alert"
          >
            {t("journalPage.editor.deleteAssetError")}
          </p>
        ) : null}
      </section>
    );
  }

  function addJournalObject(
    type: JournalObjectType,
    journal: TripJournal,
    photoProps: Record<string, unknown> = {},
  ) {
    saveJournalMutation.reset();
    const nextObject = createJournalObject(type, journal, photoProps);

    setDraftJournal({
      ...journal,
      objects: [...journal.objects, nextObject],
      updatedAt: new Date().toISOString(),
    });
    setSelectedObjectId(nextObject.id);

    if (type === "note") {
      setNoteText("");
    }

    if (type === "photo") {
      setImageUrl("");
      setSelectedImageFile(null);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    }
  }

  async function addPhotoObject(journal: TripJournal) {
    saveJournalMutation.reset();
    uploadJournalAssetMutation.reset();

    if (selectedImageFile) {
      try {
        const result =
          await uploadJournalAssetMutation.mutateAsync(selectedImageFile);

        addJournalObject("photo", journal, {
          assetId: result.asset.id,
          contentType: result.asset.contentType,
          fileName: result.asset.fileName,
          imageUrl: result.asset.url,
        });
      } catch {
        return;
      }

      return;
    }

    if (imageUrl.trim()) {
      addJournalObject("photo", journal);
    }
  }

  function addAssetPhotoObject(journal: TripJournal, asset: TripJournalAsset) {
    deleteJournalAssetMutation.reset();
    addJournalObject("photo", journal, {
      assetId: asset.id,
      contentType: asset.contentType,
      fileName: asset.fileName,
      imageUrl: asset.url,
    });
  }

  function deleteAsset(asset: TripJournalAsset, journal: TripJournal) {
    const isUsed =
      isAssetUsedInJournal(asset, journal) ||
      (savedJournal ? isAssetUsedInJournal(asset, savedJournal) : false);

    if (!asset.id || isUsed) {
      return;
    }

    deleteJournalAssetMutation.mutate(asset.id);
  }

  function moveJournalObject(
    objectId: string,
    position: { x: number; y: number },
  ) {
    saveJournalMutation.reset();
    setDraftJournal((currentJournal) => {
      const journal = currentJournal ?? journalQuery.data?.journal;

      if (!journal) {
        return currentJournal;
      }

      let didMove = false;
      const objects = journal.objects.map((object) => {
        if (object.id !== objectId) {
          return object;
        }

        if (object.x === position.x && object.y === position.y) {
          return object;
        }

        didMove = true;

        return {
          ...object,
          x: position.x,
          y: position.y,
        };
      });

      return didMove
        ? {
            ...journal,
            objects,
            updatedAt: new Date().toISOString(),
          }
        : journal;
    });
  }

  function resizeJournalObjectOnPage(
    objectId: string,
    size: { width: number; height: number },
  ) {
    saveJournalMutation.reset();
    setDraftJournal((currentJournal) => {
      const journal = currentJournal ?? journalQuery.data?.journal;

      if (!journal) {
        return currentJournal;
      }

      let didResize = false;
      const objects = journal.objects.map((object) => {
        if (object.id !== objectId) {
          return object;
        }

        if (object.width === size.width && object.height === size.height) {
          return object;
        }

        didResize = true;

        return {
          ...object,
          height: size.height,
          width: size.width,
        };
      });

      return didResize
        ? {
            ...journal,
            objects,
            updatedAt: new Date().toISOString(),
          }
        : journal;
    });
  }

  function deleteSelectedObject() {
    if (!selectedObjectId) {
      return;
    }

    updateDraftObjects((objects) =>
      objects.filter((object) => object.id !== selectedObjectId),
    );
    setSelectedObjectId(null);
  }

  function moveSelectedObjectLayer(direction: JournalLayerDirection) {
    if (!selectedObjectId) {
      return;
    }

    updateDraftObjects((objects) =>
      moveObjectLayer(objects, selectedObjectId, direction),
    );
  }

  function rotateSelectedObject(delta: number) {
    if (!selectedObjectId) {
      return;
    }

    updateDraftObjects((objects) =>
      objects.map((object) =>
        object.id === selectedObjectId
          ? {
              ...object,
              rotation: normalizeRotation(object.rotation + delta),
            }
          : object,
      ),
    );
  }

  function updateDraftObjects(
    resolveObjects: (objects: JournalSceneObject[]) => JournalSceneObject[],
  ) {
    saveJournalMutation.reset();
    setDraftJournal((currentJournal) => {
      const journal = currentJournal ?? journalQuery.data?.journal;

      if (!journal) {
        return currentJournal;
      }

      const objects = resolveObjects(journal.objects);

      if (
        objects === journal.objects ||
        areJournalObjectListsEqual(objects, journal.objects)
      ) {
        return journal;
      }

      return {
        ...journal,
        objects,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function createJournalObject(
    type: JournalObjectType,
    journal: TripJournal,
    photoProps: Record<string, unknown> = {},
  ): JournalSceneObject {
    const nextIndex = journal.objects.length;
    const baseObject = buildJournalObjectBase(type, nextIndex, journal);

    if (type === "photo") {
      return {
        ...baseObject,
        width: 360,
        height: 300,
        props: {
          alt: journalQuery.data?.trip.name ?? "",
          imageUrl: imageUrl.trim(),
          ...photoProps,
        },
      };
    }

    if (type === "sticker") {
      return {
        ...baseObject,
        width: 150,
        height: 150,
        props: {
          color: "#f2a088",
          label: stickerLabel.trim() || t("journalPage.editor.defaultSticker"),
        },
      };
    }

    if (type === "tape") {
      return {
        ...baseObject,
        width: 260,
        height: 64,
        rotation: -8,
        props: {
          color: "#f2cc6f",
        },
      };
    }

    return {
      ...baseObject,
      width: 360,
      height: 220,
      props: {
        color: "#fff4c7",
        text: noteText.trim(),
      },
    };
  }
}

function isAssetUsedInJournal(asset: TripJournalAsset, journal: TripJournal) {
  return journal.objects.some((object) => {
    if (object.type !== "photo") {
      return false;
    }

    return (
      (asset.id !== null &&
        getStringProp(object.props, "assetId") === asset.id) ||
      getStringProp(object.props, "imageUrl") === asset.url
    );
  });
}

function getStringProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return typeof value === "string" ? value : null;
}

function formatAssetByteSize(byteSize: number) {
  if (!Number.isFinite(byteSize) || byteSize < 0) {
    return "";
  }

  if (byteSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(byteSize / 1024))} KB`;
  }

  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
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

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
