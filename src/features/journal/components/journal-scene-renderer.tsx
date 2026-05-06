import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState,
} from "react";
import { ImageOff } from "lucide-react";
import {
  canResizeJournalObject,
  resizeJournalObject,
} from "@/features/journal/lib/journal-scene-editing";
import type {
  JournalSceneObject,
  TripJournal,
} from "@/features/journal/types/journal";
import { cn } from "@/shared/lib/cn";

type JournalSceneRendererProps = {
  journal: TripJournal;
  className?: string;
  editable?: boolean;
  emptyDescription: string;
  emptyTitle: string;
  interactiveObjectLabel?: string;
  onObjectMove?: (objectId: string, position: { x: number; y: number }) => void;
  onObjectResize?: (
    objectId: string,
    size: { width: number; height: number },
  ) => void;
  onObjectSelect?: (objectId: string | null) => void;
  resizeHandleLabel?: string;
  selectedObjectId?: string | null;
};

export function JournalSceneRenderer({
  editable = false,
  emptyDescription,
  emptyTitle,
  interactiveObjectLabel,
  journal,
  className,
  onObjectMove,
  onObjectResize,
  onObjectSelect,
  resizeHandleLabel,
  selectedObjectId,
}: JournalSceneRendererProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<JournalObjectDragState | null>(
    null,
  );
  const [resizeState, setResizeState] =
    useState<JournalObjectResizeState | null>(null);
  const orderedObjects = [...journal.objects].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return left.id.localeCompare(right.id);
  });
  const aspectRatio = `${journal.page.width} / ${journal.page.height}`;
  const canEdit = editable && Boolean(onObjectMove || onObjectResize);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(74vh,46rem)] rounded-[1.5rem] border border-[#c79b70]/45 bg-[#fff8ea] shadow-[0_22px_50px_rgba(82,61,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]",
        className,
      )}
      style={{
        aspectRatio,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.46),transparent_32%),radial-gradient(circle_at_18%_16%,rgba(194,137,83,0.12),transparent_18%),linear-gradient(180deg,#fffaf0_0%,#f7e8cb_100%)]">
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.5rem]"
          onPointerCancel={finishObjectDrag}
          onPointerDown={handleScenePointerDown}
          onPointerMove={handleScenePointerMove}
          onPointerUp={finishObjectDrag}
          ref={sceneRef}
        >
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#8d7258_0.8px,transparent_0.8px)] [background-size:22px_22px]" />

          {orderedObjects.length === 0 ? (
            <div className="absolute left-[12%] top-[18%] w-[76%] rotate-[-3deg] rounded-[0.8rem] border border-[#d8b982]/70 bg-[#fff4c7] px-6 py-7 text-center shadow-[0_14px_26px_rgba(92,68,43,0.16)]">
              <p className="font-hand text-[2.1rem] leading-none text-[#7a4b39]">
                {emptyTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#6f5c48]">
                {emptyDescription}
              </p>
            </div>
          ) : null}

          {orderedObjects.map((object) => (
            <JournalSceneObjectView
              isDragging={dragState?.objectId === object.id}
              isEditable={canEdit}
              isResizable={canResizeJournalObject(object)}
              isSelected={selectedObjectId === object.id}
              key={object.id}
              object={object}
              onKeyMove={moveObjectFromKeyboard}
              onPointerDown={startObjectDrag}
              onResizePointerDown={startObjectResize}
              onSelect={selectObject}
              pageHeight={journal.page.height}
              pageWidth={journal.page.width}
              resizeHandleLabel={resizeHandleLabel}
              selectedLabel={interactiveObjectLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );

  function handleScenePointerDown() {
    if (!canEdit) {
      return;
    }

    onObjectSelect?.(null);
  }

  function startObjectDrag(
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) {
    if (!canEdit || object.locked) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onObjectSelect?.(object.id);

    const pointerPosition = getPagePointFromPointerEvent(
      event,
      sceneRef.current,
      journal.page.width,
      journal.page.height,
    );

    if (!pointerPosition) {
      return;
    }

    sceneRef.current?.setPointerCapture(event.pointerId);
    setResizeState(null);
    setDragState({
      height: object.height,
      objectId: object.id,
      offsetX: pointerPosition.x - object.x,
      offsetY: pointerPosition.y - object.y,
      width: object.width,
    });
  }

  function handleScenePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointerPosition = getPagePointFromPointerEvent(
      event,
      sceneRef.current,
      journal.page.width,
      journal.page.height,
    );

    if (!pointerPosition) {
      return;
    }

    if (resizeState && canEdit && onObjectResize) {
      event.preventDefault();
      const resizedObject = resizeJournalObject({
        nextHeight:
          resizeState.initialHeight +
          (pointerPosition.y - resizeState.originPointerY),
        nextWidth:
          resizeState.initialWidth +
          (pointerPosition.x - resizeState.originPointerX),
        object: resizeState.object,
        pageHeight: journal.page.height,
        pageWidth: journal.page.width,
      });

      onObjectResize(resizeState.objectId, {
        height: resizedObject.height,
        width: resizedObject.width,
      });
      return;
    }

    if (!dragState || !canEdit || !onObjectMove) {
      return;
    }

    event.preventDefault();
    onObjectMove(dragState.objectId, {
      x: Math.round(
        clamp(
          pointerPosition.x - dragState.offsetX,
          0,
          journal.page.width - dragState.width,
        ),
      ),
      y: Math.round(
        clamp(
          pointerPosition.y - dragState.offsetY,
          0,
          journal.page.height - dragState.height,
        ),
      ),
    });
  }

  function finishObjectDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragState && !resizeState) {
      return;
    }

    if (sceneRef.current?.hasPointerCapture(event.pointerId)) {
      sceneRef.current.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
    setResizeState(null);
  }

  function selectObject(objectId: string) {
    if (!canEdit) {
      return;
    }

    onObjectSelect?.(objectId);
  }

  function moveObjectFromKeyboard(
    event: KeyboardEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) {
    if (!canEdit || object.locked || !onObjectMove) {
      return;
    }

    const step = event.shiftKey ? 24 : 8;
    const movement = resolveKeyboardMovement(event.key, step);

    if (!movement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onObjectSelect?.(object.id);
    onObjectMove(object.id, {
      x: Math.round(
        clamp(object.x + movement.x, 0, journal.page.width - object.width),
      ),
      y: Math.round(
        clamp(object.y + movement.y, 0, journal.page.height - object.height),
      ),
    });
  }

  function startObjectResize(
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) {
    if (!canEdit || !onObjectResize || !canResizeJournalObject(object)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onObjectSelect?.(object.id);

    const pointerPosition = getPagePointFromPointerEvent(
      event,
      sceneRef.current,
      journal.page.width,
      journal.page.height,
    );

    if (!pointerPosition) {
      return;
    }

    sceneRef.current?.setPointerCapture(event.pointerId);
    setDragState(null);
    setResizeState({
      initialHeight: object.height,
      initialWidth: object.width,
      object,
      objectId: object.id,
      originPointerX: pointerPosition.x,
      originPointerY: pointerPosition.y,
    });
  }
}

type JournalSceneObjectViewProps = {
  isDragging: boolean;
  isEditable: boolean;
  isResizable: boolean;
  isSelected: boolean;
  object: JournalSceneObject;
  onKeyMove: (
    event: KeyboardEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) => void;
  onPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) => void;
  onResizePointerDown: (
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) => void;
  onSelect: (objectId: string) => void;
  pageWidth: number;
  pageHeight: number;
  resizeHandleLabel?: string;
  selectedLabel?: string;
};

function JournalSceneObjectView({
  isDragging,
  isEditable,
  isResizable,
  isSelected,
  object,
  onKeyMove,
  onPointerDown,
  onResizePointerDown,
  onSelect,
  pageHeight,
  pageWidth,
  resizeHandleLabel,
  selectedLabel,
}: JournalSceneObjectViewProps) {
  const style: CSSProperties = {
    left: `${(object.x / pageWidth) * 100}%`,
    top: `${(object.y / pageHeight) * 100}%`,
    width: `${(object.width / pageWidth) * 100}%`,
    height: `${(object.height / pageHeight) * 100}%`,
    transform: `rotate(${object.rotation}deg)`,
    zIndex: object.zIndex,
  };

  return (
    <div
      aria-label={
        isEditable && !object.locked ? (selectedLabel ?? object.id) : undefined
      }
      aria-pressed={isEditable && !object.locked ? isSelected : undefined}
      className={cn(
        "absolute origin-center",
        isEditable && !object.locked
          ? "touch-none cursor-grab select-none rounded-[0.9rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4d8f72]/45"
          : undefined,
        isSelected
          ? "ring-4 ring-[#4d8f72] ring-offset-2 ring-offset-[#fff8ea]"
          : undefined,
        isDragging ? "cursor-grabbing" : undefined,
      )}
      onClick={(event) => {
        if (!isEditable || object.locked) {
          return;
        }

        event.stopPropagation();
        onSelect(object.id);
      }}
      onKeyDown={(event) => onKeyMove(event, object)}
      onPointerDown={(event) => onPointerDown(event, object)}
      role={isEditable && !object.locked ? "button" : undefined}
      style={style}
      tabIndex={isEditable && !object.locked ? 0 : undefined}
    >
      {renderJournalObject(object)}
      {isEditable && isSelected && isResizable ? (
        <div
          aria-label={resizeHandleLabel}
          className="absolute -bottom-3 -right-3 h-6 w-6 touch-none rounded-full border-2 border-white bg-[#4d8f72] shadow-[0_6px_14px_rgba(39,81,59,0.28)] transition hover:scale-105"
          onPointerDown={(event) => onResizePointerDown(event, object)}
          role="button"
          tabIndex={-1}
          title={resizeHandleLabel}
        >
          <span className="absolute inset-[0.32rem] rounded-full border border-white/70" />
        </div>
      ) : null}
    </div>
  );
}

function renderJournalObject(object: JournalSceneObject) {
  switch (object.type) {
    case "photo":
      return <PhotoObject object={object} />;
    case "sticker":
      return <StickerObject object={object} />;
    case "tape":
      return <TapeObject object={object} />;
    case "note":
    default:
      return <NoteObject object={object} />;
  }
}

function PhotoObject({ object }: { object: JournalSceneObject }) {
  const imageUrl =
    getUrlProp(object.props, "imageUrl") ?? getUrlProp(object.props, "src");
  const alt = getStringProp(object.props, "alt") ?? "";

  return (
    <div className="h-full w-full rounded-[0.7rem] border-[0.55rem] border-white bg-white shadow-[0_14px_26px_rgba(70,50,32,0.2)]">
      {imageUrl ? (
        <img
          alt={alt}
          className="h-full w-full rounded-[0.28rem] object-cover"
          draggable={false}
          src={imageUrl}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[0.28rem] bg-[#ead7b7] text-[#8a6d51]">
          <ImageOff aria-hidden="true" className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

function NoteObject({ object }: { object: JournalSceneObject }) {
  const text = getStringProp(object.props, "text") ?? "";
  const color = getColorProp(object.props, "color") ?? "#fff4c7";

  return (
    <div
      className="flex h-full w-full items-center rounded-[0.8rem] border border-[#d8b982]/70 px-4 py-3 font-hand text-[1.15rem] leading-tight text-[#71412e] shadow-[0_12px_24px_rgba(92,68,43,0.14)] sm:text-[1.45rem] md:text-[1.7rem]"
      style={{ backgroundColor: color }}
    >
      <span className="line-clamp-5">{text}</span>
    </div>
  );
}

function StickerObject({ object }: { object: JournalSceneObject }) {
  const label =
    getStringProp(object.props, "label") ??
    getStringProp(object.props, "stickerKey") ??
    "";
  const color = getColorProp(object.props, "color") ?? "#f2a088";

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border border-white/70 px-2 text-center font-hand text-[0.95rem] font-bold leading-none text-[#5d382b] shadow-[0_10px_20px_rgba(92,68,43,0.18)] sm:text-[1.15rem] md:text-[1.35rem]"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}

function TapeObject({ object }: { object: JournalSceneObject }) {
  const color = getColorProp(object.props, "color") ?? "#f2cc6f";

  return (
    <div
      className="h-full w-full border border-white/30 opacity-80 shadow-[0_6px_12px_rgba(92,68,43,0.12)] [clip-path:polygon(3%_0,100%_6%,96%_100%,0_91%)]"
      style={{ backgroundColor: color }}
    />
  );
}

function getStringProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getUrlProp(props: Record<string, unknown>, key: string) {
  const value = getStringProp(props, key);

  if (value === null) {
    return null;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function getColorProp(props: Record<string, unknown>, key: string) {
  const value = getStringProp(props, key);

  if (value === null) {
    return null;
  }

  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : null;
}

type JournalObjectDragState = {
  height: number;
  objectId: string;
  offsetX: number;
  offsetY: number;
  width: number;
};

type JournalObjectResizeState = {
  initialHeight: number;
  initialWidth: number;
  object: JournalSceneObject;
  objectId: string;
  originPointerX: number;
  originPointerY: number;
};

function getPagePointFromPointerEvent(
  event: PointerEvent,
  sceneElement: HTMLDivElement | null,
  pageWidth: number,
  pageHeight: number,
) {
  if (!sceneElement) {
    return null;
  }

  const rect = sceneElement.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    x: ((event.clientX - rect.left) / rect.width) * pageWidth,
    y: ((event.clientY - rect.top) / rect.height) * pageHeight,
  };
}

function resolveKeyboardMovement(key: string, step: number) {
  switch (key) {
    case "ArrowDown":
      return { x: 0, y: step };
    case "ArrowLeft":
      return { x: -step, y: 0 };
    case "ArrowRight":
      return { x: step, y: 0 };
    case "ArrowUp":
      return { x: 0, y: -step };
    default:
      return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
