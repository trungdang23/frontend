import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  getPlanNodeStickers,
  savePlanNodeStickers,
} from '@/features/trips/planning/api/planner-api';
import type { PlanNode } from '@/features/trips/planning/types/plan-node';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pageDotStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

const plannerCoordinateMax = 10000;

const plannerActivityStickerOptions = [
  {
    key: 'sun',
    labelKey: 'trips.planner.board.activitySpread.stickers.sun',
    symbol: '☀',
    className: 'border-[#d99028] bg-[#ffe08a] text-[#7a4318]',
    rotation: -8,
    scale: 110,
  },
  {
    key: 'camera',
    labelKey: 'trips.planner.board.activitySpread.stickers.camera',
    symbol: '◉',
    className: 'border-[#4b5563] bg-[#d8edf7] text-[#1f2937]',
    rotation: 6,
    scale: 104,
  },
  {
    key: 'ticket',
    labelKey: 'trips.planner.board.activitySpread.stickers.ticket',
    symbol: '▰',
    className: 'border-[#b45309] bg-[#ffd2a8] text-[#7c2d12]',
    rotation: -4,
    scale: 108,
  },
  {
    key: 'spark',
    labelKey: 'trips.planner.board.activitySpread.stickers.spark',
    symbol: '✦',
    className: 'border-[#8b5cf6] bg-[#ede9fe] text-[#5b21b6]',
    rotation: 10,
    scale: 100,
  },
] as const;

type PlannerActivityStickerKey =
  (typeof plannerActivityStickerOptions)[number]['key'];

type PlannerActivitySticker = {
  id: string;
  stickerKey: PlannerActivityStickerKey;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
};

type PlannerStickerDragState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

export type PlannerActivityFormValues = {
  title: string;
  date: string;
  time: string;
  location: string;
  budget: string;
  notes: string;
};

const initialActivityFormValues: PlannerActivityFormValues = {
  title: '',
  date: '',
  time: '',
  location: '',
  budget: '',
  notes: '',
};

const draftPlannerActivityStickers: PlannerActivitySticker[] = [
  {
    id: 'draft-sun',
    stickerKey: 'sun',
    x: 1700,
    y: 1900,
    rotation: -8,
    scale: 108,
    zIndex: 0,
  },
  {
    id: 'draft-ticket',
    stickerKey: 'ticket',
    x: 7900,
    y: 7400,
    rotation: 7,
    scale: 96,
    zIndex: 1,
  },
];

function PlannerTapeTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn('relative mx-auto w-fit px-7 py-2 text-center', className)}>
      <span className="absolute inset-0 -skew-x-6 rounded-[0.2rem] bg-[#a8dfd5]/85 shadow-[0_4px_0_rgba(80,115,104,0.18)]" />
      <span className="absolute -left-3 top-0 h-full w-5 bg-[repeating-linear-gradient(135deg,#5b7da7_0_5px,#f4e9bf_5px_10px)] [clip-path:polygon(0_0,100%_0,78%_50%,100%_100%,0_100%)]" />
      <span className="absolute -right-3 top-0 h-full w-5 bg-[#a8dfd5]/85 [clip-path:polygon(0_0,100%_0,78%_50%,100%_100%,0_100%)]" />
      <span className="relative z-10 whitespace-nowrap font-cursive text-[1.6rem] font-bold leading-none text-[#1f2a24] sm:text-[2rem]">
        {children}
      </span>
    </div>
  );
}

function clampPlannerCoordinate(value: number) {
  return Math.min(plannerCoordinateMax, Math.max(0, Math.round(value)));
}

function plannerCoordinateToPercent(value: number) {
  return `${value / 100}%`;
}

function createPlannerStickerId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `sticker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getPlannerPointerCoordinates(
  event: ReactPointerEvent<HTMLElement>,
  frame: HTMLElement,
) {
  const rect = frame.getBoundingClientRect();

  return {
    x: clampPlannerCoordinate(
      ((event.clientX - rect.left) / rect.width) * plannerCoordinateMax,
    ),
    y: clampPlannerCoordinate(
      ((event.clientY - rect.top) / rect.height) * plannerCoordinateMax,
    ),
  };
}

function isPlannerActivityStickerKey(
  value: string,
): value is PlannerActivityStickerKey {
  return plannerActivityStickerOptions.some((option) => option.key === value);
}

function PlannerActivityField({
  label,
  onChange,
  placeholder,
  value,
  multiline = false,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-cursive text-[1.45rem] font-bold leading-none text-[#251b15] sm:text-[1.75rem]">
        {label}
      </span>
      {multiline ? (
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 px-4 py-3 font-marker text-[1.05rem] leading-tight text-[#3d332b] outline-none placeholder:text-[#71675c] focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className="mt-2 w-full rounded-[0.8rem] border border-dashed border-[#b9aea0] bg-white/60 px-4 py-3 font-marker text-[1.05rem] text-[#3d332b] outline-none placeholder:text-[#71675c] focus:border-[#7c6a58] focus:bg-white/80 focus:ring-2 focus:ring-[#b88a56]/20 sm:text-[1.2rem]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}

function PlannerActivityDetailsPage({
  isSavingActivity,
  onCreateActivity,
  onBack,
}: {
  isSavingActivity: boolean;
  onCreateActivity: (values: PlannerActivityFormValues) => Promise<void>;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [formValues, setFormValues] = useState<PlannerActivityFormValues>(
    initialActivityFormValues,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success'>('success');

  const updateFormValue = (
    field: keyof PlannerActivityFormValues,
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.title.trim()) {
      setFeedbackTone('error');
      setFeedback(t('trips.planner.validation.titleRequired'));
      return;
    }

    try {
      await onCreateActivity(formValues);
      setFormValues(initialActivityFormValues);
      setFeedbackTone('success');
      setFeedback(t('trips.planner.board.activitySpread.feedback.activitySaved'));
    } catch {
      setFeedbackTone('error');
      setFeedback(t('trips.planner.board.activitySpread.feedback.activitySaveError'));
    }
  };

  return (
    <form
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden border-b border-gray-100 bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:min-h-0 md:border-r md:border-b-0 lg:px-8"
      onSubmit={handleSubmit}
      style={pageDotStyle}
    >
      <button
        className="relative z-40 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-4 py-2 font-hand text-[1.25rem] leading-none text-[#6b4938] shadow-[0_10px_18px_rgba(90,62,40,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#fff8ea] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25 sm:text-[1.45rem]"
        onClick={onBack}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        {t('trips.planner.board.activitySpread.backToGeneralAction')}
      </button>

      <PlannerTapeTitle className="mt-4">
        {t('trips.planner.board.activitySpread.stepTitle')}
      </PlannerTapeTitle>

      <div className="relative z-10 mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        <div className="sm:col-span-2">
          <PlannerActivityField
            label={t('trips.planner.board.activitySpread.fields.title')}
            onChange={(value) => updateFormValue('title', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.title')}
            value={formValues.title}
          />
        </div>
        <PlannerActivityField
          label={t('trips.planner.board.activitySpread.fields.date')}
          onChange={(value) => updateFormValue('date', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.date')}
          value={formValues.date}
        />
        <PlannerActivityField
          label={t('trips.planner.board.activitySpread.fields.time')}
          onChange={(value) => updateFormValue('time', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.time')}
          value={formValues.time}
        />
        <PlannerActivityField
          label={t('trips.planner.board.activitySpread.fields.location')}
          onChange={(value) => updateFormValue('location', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.location')}
          value={formValues.location}
        />
        <PlannerActivityField
          label={t('trips.planner.board.activitySpread.fields.budget')}
          onChange={(value) => updateFormValue('budget', value)}
          placeholder={t('trips.planner.board.activitySpread.placeholders.budget')}
          value={formValues.budget}
        />
        <div className="sm:col-span-2">
          <PlannerActivityField
            label={t('trips.planner.board.activitySpread.fields.notes')}
            multiline
            onChange={(value) => updateFormValue('notes', value)}
            placeholder={t('trips.planner.board.activitySpread.placeholders.notes')}
            value={formValues.notes}
          />
        </div>
      </div>

      {feedback ? (
        <p
          className={cn(
            'relative z-10 mt-4 rounded-[0.8rem] px-4 py-3 text-sm font-semibold',
            feedbackTone === 'error'
              ? 'border border-[#f1a69b] bg-[#fff1ef] text-[#b42318]'
              : 'border border-[#b7d88a] bg-[#f1f8df] text-[#315c24]',
          )}
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <div className="relative z-10 mt-auto flex justify-end pt-5">
        <button
          className="inline-flex items-center rounded-full border border-[#3a5d25] bg-[#b9e177] px-5 py-2.5 font-cursive text-[1.65rem] font-bold leading-none text-[#172612] shadow-[0_7px_0_#6f9e44,0_14px_24px_rgba(55,83,34,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 disabled:cursor-wait disabled:opacity-70 sm:px-6 sm:text-[1.9rem]"
          disabled={isSavingActivity}
          type="submit"
        >
          {isSavingActivity
            ? t('trips.actions.addingActivity')
            : t('trips.actions.addActivity')}
        </button>
      </div>
    </form>
  );
}

function PlannerActivityStickerCanvas({
  nodeId,
}: {
  nodeId: string | null;
}) {
  const { t } = useI18n();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<PlannerStickerDragState | null>(null);
  const [stickers, setStickers] = useState<PlannerActivitySticker[]>(
    draftPlannerActivityStickers,
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'loading' | 'saving' | 'saved' | 'error'
  >('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadedStickerNodeId, setLoadedStickerNodeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!nodeId) {
      return;
    }

    const abortController = new AbortController();

    getPlanNodeStickers(nodeId, {
      signal: abortController.signal,
    })
      .then((nextStickers) => {
        setStickers(
          nextStickers
            .filter((sticker) => isPlannerActivityStickerKey(sticker.stickerKey))
            .map((sticker) => ({
              id: sticker.id,
              stickerKey: sticker.stickerKey as PlannerActivityStickerKey,
              x: sticker.x,
              y: sticker.y,
              rotation: sticker.rotation,
              scale: sticker.scale,
              zIndex: sticker.zIndex,
            })),
        );
        setLoadedStickerNodeId(nodeId);
        setSyncStatus('idle');
        setFeedback(t('trips.planner.board.activitySpread.feedback.loaded'));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setSyncStatus('error');
        setLoadedStickerNodeId(nodeId);
        setFeedback(t('trips.planner.board.activitySpread.feedback.loadError'));
      });

    return () => {
      abortController.abort();
    };
  }, [nodeId, t]);

  const isLoadingStickers =
    Boolean(nodeId) &&
    loadedStickerNodeId !== nodeId &&
    syncStatus !== 'error' &&
    syncStatus !== 'saving';
  const feedbackText =
    isLoadingStickers
      ? t('trips.planner.board.activitySpread.feedback.loading')
      : feedback ?? t('trips.planner.board.activitySpread.feedback.localOnly');

  const addSticker = (stickerKey: PlannerActivityStickerKey) => {
    const option = plannerActivityStickerOptions.find(
      (currentOption) => currentOption.key === stickerKey,
    );

    if (!option) {
      return;
    }

    setStickers((currentStickers) => {
      const nextIndex = currentStickers.length;
      const highestZIndex = currentStickers.reduce(
        (highest, sticker) => Math.max(highest, sticker.zIndex),
        -1,
      );

      return [
        ...currentStickers,
        {
          id: createPlannerStickerId(),
          stickerKey,
          x: clampPlannerCoordinate(3800 + (nextIndex % 3) * 900),
          y: clampPlannerCoordinate(3100 + (nextIndex % 4) * 820),
          rotation: option.rotation,
          scale: option.scale,
          zIndex: highestZIndex + 1,
        },
      ];
    });
    setSyncStatus('idle');
    setFeedback(t('trips.planner.board.activitySpread.feedback.added'));
  };

  const clearStickers = () => {
    setStickers([]);
    setSyncStatus('idle');
    setFeedback(t('trips.planner.board.activitySpread.feedback.cleared'));
  };

  const startStickerDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    sticker: PlannerActivitySticker,
  ) => {
    if (!frameRef.current) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const pointerCoordinates = getPlannerPointerCoordinates(
      event,
      frameRef.current,
    );

    dragStateRef.current = {
      id: sticker.id,
      offsetX: pointerCoordinates.x - sticker.x,
      offsetY: pointerCoordinates.y - sticker.y,
    };
    setActiveDragId(sticker.id);
  };

  const moveSticker = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!frameRef.current || !dragStateRef.current) {
      return;
    }

    event.preventDefault();

    const pointerCoordinates = getPlannerPointerCoordinates(
      event,
      frameRef.current,
    );
    const dragState = dragStateRef.current;

    setStickers((currentStickers) =>
      currentStickers.map((sticker) =>
        sticker.id === dragState.id
          ? {
              ...sticker,
              x: clampPlannerCoordinate(pointerCoordinates.x - dragState.offsetX),
              y: clampPlannerCoordinate(pointerCoordinates.y - dragState.offsetY),
            }
          : sticker,
      ),
    );
  };

  const stopStickerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStateRef.current) {
      event.preventDefault();
    }

    dragStateRef.current = null;
    setActiveDragId(null);
  };

  const saveStickers = async () => {
    if (!nodeId) {
      setSyncStatus('idle');
      setFeedback(t('trips.planner.board.activitySpread.feedback.localOnly'));
      return;
    }

    setSyncStatus('saving');
    setFeedback(t('trips.planner.board.activitySpread.feedback.saving'));

    try {
      const savedStickers = await savePlanNodeStickers(nodeId, {
        stickers: stickers.map((sticker) => ({
          id: sticker.id,
          stickerKey: sticker.stickerKey,
          x: sticker.x,
          y: sticker.y,
          rotation: sticker.rotation,
          scale: sticker.scale,
          zIndex: sticker.zIndex,
        })),
      });

      setStickers(
        savedStickers
          .filter((sticker) => isPlannerActivityStickerKey(sticker.stickerKey))
          .map((sticker) => ({
            id: sticker.id,
            stickerKey: sticker.stickerKey as PlannerActivityStickerKey,
            x: sticker.x,
            y: sticker.y,
            rotation: sticker.rotation,
            scale: sticker.scale,
            zIndex: sticker.zIndex,
          })),
      );
      setSyncStatus('saved');
      setLoadedStickerNodeId(nodeId);
      setFeedback(t('trips.planner.board.activitySpread.feedback.saved'));
    } catch {
      setSyncStatus('error');
      setFeedback(t('trips.planner.board.activitySpread.feedback.saveError'));
    }
  };

  return (
    <div className="relative z-10 mt-3 flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-hand text-[1.25rem] font-bold leading-none text-[#6b4938] sm:text-[1.45rem]">
            {t('trips.planner.board.activitySpread.stickerPaletteTitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plannerActivityStickerOptions.map((option) => (
            <button
              className={cn(
                'inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 px-3 font-marker text-[1.2rem] font-bold shadow-[0_6px_12px_rgba(93,70,45,0.14)] transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                option.className,
              )}
              key={option.key}
              onClick={() => addSticker(option.key)}
              type="button"
            >
              <span aria-hidden="true">{option.symbol}</span>
              <span className="sr-only">{t(option.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative mt-3 min-h-[16rem] flex-1 overflow-hidden rounded-[1.4rem] border-[3px] border-[#6d4a37] bg-[#fff7df] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_15px_28px_rgba(93,70,45,0.18)]"
        ref={frameRef}
      >
        <div className="absolute inset-0 bg-[linear-gradient(#e9d8b6_1px,transparent_1px)] bg-[length:100%_2.2rem] opacity-70" />
        <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300/55" />

        {stickers.map((sticker) => {
          const option =
            plannerActivityStickerOptions.find(
              (currentOption) => currentOption.key === sticker.stickerKey,
            ) ?? plannerActivityStickerOptions[0];

          return (
            <button
              aria-label={t('trips.planner.board.activitySpread.dragStickerLabel', {
                sticker: t(option.labelKey),
              })}
              className={cn(
                'absolute grid h-14 w-14 touch-none select-none place-items-center rounded-full border-2 font-marker text-[1.55rem] font-bold shadow-[0_10px_18px_rgba(65,43,28,0.22)] transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-[#4f3524]/35',
                activeDragId === sticker.id
                  ? 'cursor-grabbing ring-4 ring-[#f4cf8f]/55'
                  : 'cursor-grab hover:shadow-[0_14px_24px_rgba(65,43,28,0.28)]',
                option.className,
              )}
              key={sticker.id}
              onPointerCancel={stopStickerDrag}
              onPointerDown={(event) => startStickerDrag(event, sticker)}
              onPointerMove={moveSticker}
              onPointerUp={stopStickerDrag}
              style={{
                left: plannerCoordinateToPercent(sticker.x),
                top: plannerCoordinateToPercent(sticker.y),
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale / 100})`,
                zIndex: 30 + sticker.zIndex,
              }}
              type="button"
            >
              <span aria-hidden="true">{option.symbol}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={cn(
            'min-h-5 text-sm font-medium',
            syncStatus === 'error' ? 'text-[#b42318]' : 'text-[#6b5a4d]',
          )}
          role="status"
        >
          {feedbackText}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-[#8b6244]/35 bg-white/70 px-4 py-2 font-hand text-[1.2rem] font-bold leading-none text-[#6b4938] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
            onClick={clearStickers}
            type="button"
          >
            {t('trips.planner.board.activitySpread.clearAction')}
          </button>
          <button
            className="rounded-full border border-[#3a5d25] bg-[#b9e177] px-5 py-2 font-hand text-[1.25rem] font-bold leading-none text-[#172612] shadow-[0_7px_0_#6f9e44,0_12px_22px_rgba(55,83,34,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/35 disabled:cursor-wait disabled:opacity-70"
            disabled={syncStatus === 'saving' || isLoadingStickers}
            onClick={() => void saveStickers()}
            type="button"
          >
            {syncStatus === 'saving'
              ? t('trips.planner.board.activitySpread.savingAction')
              : t('trips.planner.board.activitySpread.saveAction')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlannerActivityStickerPage({
  activityNodes,
  nodeId,
  onSelectActivity,
}: {
  activityNodes: PlanNode[];
  nodeId: string | null;
  onSelectActivity: (nodeId: string | null) => void;
}) {
  const { t } = useI18n();
  const selectedActivity = activityNodes.find((activityNode) => activityNode.id === nodeId);

  return (
    <div
      className="relative flex h-full min-h-[33rem] flex-col overflow-hidden bg-[#fffdfa] px-5 py-5 sm:px-7 sm:py-6 md:min-h-0 lg:px-8"
      style={pageDotStyle}
    >
      <PlannerTapeTitle className="mt-1">
        {t('trips.planner.board.activitySpread.canvasPageTitle')}
      </PlannerTapeTitle>

      <section className="relative z-10 mt-3 rounded-[1rem] border border-[#d5c5a9] bg-white/62 px-4 py-3 shadow-[0_10px_20px_rgba(93,70,45,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-hand text-[1.4rem] font-bold leading-none text-[#251b15] sm:text-[1.65rem]">
            {t('trips.planner.board.activitySpread.activitiesTitle')}
          </h3>
          <button
            className="rounded-full border border-[#8b6244]/35 bg-[#fff1d9] px-3 py-1.5 text-xs font-bold text-[#6b4938] transition hover:-translate-y-0.5"
            onClick={() => onSelectActivity(null)}
            type="button"
          >
            {t('trips.actions.addAnotherActivity')}
          </button>
        </div>

        {selectedActivity ? (
          <p className="mt-2 text-xs font-semibold text-[#6f6258]">
            {t('trips.planner.board.activitySpread.selectedActivity', {
              title: selectedActivity.title,
            })}
          </p>
        ) : null}

        {activityNodes.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-[#6f6258]">
            {t('trips.planner.board.activitySpread.activitiesEmpty')}
          </p>
        ) : (
          <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
            {activityNodes.map((activityNode) => (
              <button
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-bold transition hover:-translate-y-0.5',
                  activityNode.id === nodeId
                    ? 'border-[#315c42] bg-[#b9e177] text-[#172612]'
                    : 'border-[#8b6244]/30 bg-[#fffaf0] text-[#6b4938]',
                )}
                key={activityNode.id}
                onClick={() => onSelectActivity(activityNode.id)}
                type="button"
              >
                {activityNode.title}
              </button>
            ))}
          </div>
        )}
      </section>

      <PlannerActivityStickerCanvas
        key={nodeId ?? 'draft-activity-stickers'}
        nodeId={nodeId}
      />
    </div>
  );
}

export function PlannerActivitySpread({
  activityNodes,
  isSavingActivity,
  nodeId,
  onCreateActivity,
  onSelectActivity,
  onBack,
}: {
  activityNodes: PlanNode[];
  isSavingActivity: boolean;
  nodeId: string | null;
  onCreateActivity: (values: PlannerActivityFormValues) => Promise<void>;
  onSelectActivity: (nodeId: string | null) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="md:h-full md:w-1/2">
        <PlannerActivityDetailsPage
          isSavingActivity={isSavingActivity}
          onBack={onBack}
          onCreateActivity={onCreateActivity}
        />
      </div>
      <div className="md:h-full md:w-1/2">
        <PlannerActivityStickerPage
          activityNodes={activityNodes}
          nodeId={nodeId}
          onSelectActivity={onSelectActivity}
        />
      </div>
    </div>
  );
}
