import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState,
} from "react";
import { ImageOff } from "lucide-react";
import {
  canRotateJournalObject,
  canResizeJournalObject,
  clamp,
  getJournalObjectCenter,
  resizeJournalObject,
  rotateJournalObjectFromPointer,
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
    size: { width: number; height: number; x?: number; y?: number },
  ) => void;
  onObjectRotate?: (objectId: string, rotation: number) => void;
  onObjectSelect?: (objectId: string | null) => void;
  resizeHandleLabel?: string;
  rotateHandleLabel?: string;
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
  onObjectRotate,
  onObjectSelect,
  resizeHandleLabel,
  rotateHandleLabel,
  selectedObjectId,
}: JournalSceneRendererProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<JournalObjectDragState | null>(
    null,
  );
  const [resizeState, setResizeState] =
    useState<JournalObjectResizeState | null>(null);
  const [rotateState, setRotateState] =
    useState<JournalObjectRotateState | null>(null);
  const orderedObjects = [...journal.objects].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return left.id.localeCompare(right.id);
  });
  const aspectRatio = `${journal.page.width} / ${journal.page.height}`;
  const canEdit =
    editable && Boolean(onObjectMove || onObjectResize || onObjectRotate);

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
              onRotatePointerDown={startObjectRotate}
              onSelect={selectObject}
              pageHeight={journal.page.height}
              pageWidth={journal.page.width}
              resizeHandleLabel={resizeHandleLabel}
              rotateHandleLabel={rotateHandleLabel}
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
    setRotateState(null);
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

    if (rotateState && canEdit && onObjectRotate) {
      event.preventDefault();
      const rotation = rotateJournalObjectFromPointer({
        center: rotateState.center,
        currentPointer: pointerPosition,
        initialRotation: rotateState.initialRotation,
        originPointer: rotateState.originPointer,
      });

      onObjectRotate(rotateState.objectId, rotation);
      return;
    }

    if (resizeState && canEdit && onObjectResize) {
      event.preventDefault();
      const dx = pointerPosition.x - resizeState.originPointerX;
      const dy = pointerPosition.y - resizeState.originPointerY;
      const { anchor, initialHeight, initialWidth, object } = resizeState;

      let nextWidth = initialWidth;
      let nextHeight = initialHeight;
      let nextX = object.x;
      let nextY = object.y;

      switch (anchor) {
        case "right":
        case "bottom-right":
        case "top-right":
          nextWidth = clamp(initialWidth + dx, 1, journal.page.width - object.x);
          break;
        case "left":
        case "bottom-left":
        case "top-left":
          nextWidth = clamp(initialWidth - dx, 1, journal.page.width);
          nextX = clamp(object.x + dx, 0, journal.page.width - 1);
          break;
      }

      switch (anchor) {
        case "bottom":
        case "bottom-left":
        case "bottom-right":
          nextHeight = clamp(initialHeight + dy, 1, journal.page.height - object.y);
          break;
        case "top":
        case "top-left":
        case "top-right":
          nextHeight = clamp(initialHeight - dy, 1, journal.page.height);
          nextY = clamp(object.y + dy, 0, journal.page.height - 1);
          break;
      }

      onObjectResize(resizeState.objectId, {
        height: nextHeight,
        width: nextWidth,
        ...(nextX !== object.x || nextY !== object.y
          ? { x: nextX, y: nextY }
          : {}),
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
    if (!dragState && !resizeState && !rotateState) {
      return;
    }

    if (sceneRef.current?.hasPointerCapture(event.pointerId)) {
      sceneRef.current.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
    setResizeState(null);
    setRotateState(null);
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
    anchor: ResizeAnchor = "bottom-right",
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
    setRotateState(null);
    setResizeState({
      anchor,
      initialHeight: object.height,
      initialWidth: object.width,
      object,
      objectId: object.id,
      originPointerX: pointerPosition.x,
      originPointerY: pointerPosition.y,
    });
  }

  function startObjectRotate(
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) {
    if (!canEdit || !onObjectRotate || !canRotateJournalObject(object)) {
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
    setResizeState(null);
    setRotateState({
      center: getJournalObjectCenter(object),
      initialRotation: object.rotation,
      objectId: object.id,
      originPointer: pointerPosition,
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
    anchor?: ResizeAnchor,
  ) => void;
  onRotatePointerDown: (
    event: PointerEvent<HTMLDivElement>,
    object: JournalSceneObject,
  ) => void;
  onSelect: (objectId: string) => void;
  pageWidth: number;
  pageHeight: number;
  resizeHandleLabel?: string;
  rotateHandleLabel?: string;
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
  onRotatePointerDown,
  onSelect,
  pageHeight,
  pageWidth,
  resizeHandleLabel,
  rotateHandleLabel,
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
      {isEditable && isSelected && !object.locked ? (
        <div
          aria-label={rotateHandleLabel}
          className="absolute left-1/2 top-0 h-9 w-9 -translate-x-1/2 -translate-y-[calc(100%+0.9rem)] touch-none rounded-full border-2 border-white bg-[#f2cc6f] shadow-[0_8px_18px_rgba(92,68,43,0.24)] transition hover:scale-105"
          onPointerDown={(event) => onRotatePointerDown(event, object)}
          role="button"
          tabIndex={-1}
          title={rotateHandleLabel}
        >
          <span className="absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 bg-[#7a4b39]/55" />
          <span className="absolute inset-[0.45rem] rounded-full border-2 border-[#7a4b39]/70 border-r-transparent" />
          <span className="absolute right-[0.48rem] top-[0.42rem] h-2 w-2 rotate-45 border-r-2 border-t-2 border-[#7a4b39]/70" />
        </div>
      ) : null}
      {isEditable && isSelected && isResizable ? (
        <>
          <ResizeHandle
            anchor="top-left"
            className="-left-3 -top-3"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "top-left")
            }
          />
          <ResizeHandle
            anchor="top"
            className="left-1/2 -top-3 -translate-x-1/2"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "top")
            }
          />
          <ResizeHandle
            anchor="top-right"
            className="-right-3 -top-3"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "top-right")
            }
          />
          <ResizeHandle
            anchor="right"
            className="-right-3 top-1/2 -translate-y-1/2"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "right")
            }
          />
          <ResizeHandle
            anchor="bottom-right"
            className="-bottom-3 -right-3"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "bottom-right")
            }
          />
          <ResizeHandle
            anchor="bottom"
            className="-bottom-3 left-1/2 -translate-x-1/2"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "bottom")
            }
          />
          <ResizeHandle
            anchor="bottom-left"
            className="-bottom-3 -left-3"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "bottom-left")
            }
          />
          <ResizeHandle
            anchor="left"
            className="-left-3 top-1/2 -translate-y-1/2"
            label={resizeHandleLabel}
            onPointerDown={(event) =>
              onResizePointerDown(event, object, "left")
            }
          />
        </>
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
  anchor: ResizeAnchor;
  initialHeight: number;
  initialWidth: number;
  object: JournalSceneObject;
  objectId: string;
  originPointerX: number;
  originPointerY: number;
};

type ResizeAnchor = "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";

type JournalObjectRotateState = {
  center: {
    x: number;
    y: number;
  };
  initialRotation: number;
  objectId: string;
  originPointer: {
    x: number;
    y: number;
  };
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

function ResizeHandle({
  anchor,
  className,
  label,
  onPointerDown,
}: {
  anchor: ResizeAnchor;
  className: string;
  label?: string;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
}) {
  const isCorner = anchor.includes("-");

  return (
    <div
      aria-label={label}
      className={cn(
        "absolute h-5 w-5 touch-none rounded-full border-2 border-white transition hover:scale-110",
        isCorner
          ? "bg-[#4d8f72] h-6 w-6 shadow-[0_6px_14px_rgba(39,81,59,0.28)]"
          : "bg-[#7aac9a] shadow-[0_4px_10px_rgba(39,81,59,0.18)]",
        className,
      )}
      onPointerDown={onPointerDown}
      role="button"
      tabIndex={-1}
      title={label}
    >
      {isCorner ? (
        <span className="absolute inset-[0.32rem] rounded-full border border-white/70" />
      ) : null}
    </div>
  );
}
