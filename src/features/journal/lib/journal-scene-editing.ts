import type {
  JournalSceneObject,
  TripJournal,
} from "@/features/journal/types/journal";

export type JournalLayerDirection = "backward" | "forward";
export type ResizableJournalObjectType = "note" | "photo";

const RESIZABLE_OBJECT_TYPES: ResizableJournalObjectType[] = ["note", "photo"];

type JournalPoint = {
  x: number;
  y: number;
};

export function canMoveObjectLayer(
  objects: JournalSceneObject[],
  objectId: string,
  direction: JournalLayerDirection,
) {
  const objectIndex = getLayerOrderedObjects(objects).findIndex(
    (object) => object.id === objectId,
  );

  if (objectIndex < 0) {
    return false;
  }

  return direction === "forward"
    ? objectIndex < objects.length - 1
    : objectIndex > 0;
}

export function moveObjectLayer(
  objects: JournalSceneObject[],
  objectId: string,
  direction: JournalLayerDirection,
) {
  const orderedObjects = getLayerOrderedObjects(objects);
  const objectIndex = orderedObjects.findIndex(
    (object) => object.id === objectId,
  );
  const targetIndex =
    direction === "forward" ? objectIndex + 1 : objectIndex - 1;
  const currentObject = orderedObjects[objectIndex];
  const targetObject = orderedObjects[targetIndex];

  if (!currentObject || !targetObject) {
    return objects;
  }

  return objects.map((object) => {
    if (object.id === currentObject.id) {
      return {
        ...object,
        zIndex: targetObject.zIndex,
      };
    }

    if (object.id === targetObject.id) {
      return {
        ...object,
        zIndex: currentObject.zIndex,
      };
    }

    return object;
  });
}

export function canResizeJournalObject(object: JournalSceneObject) {
  return (
    !object.locked &&
    RESIZABLE_OBJECT_TYPES.includes(object.type as ResizableJournalObjectType)
  );
}

export function canRotateJournalObject(object: JournalSceneObject) {
  return !object.locked;
}

export function resizeJournalObject(input: {
  object: JournalSceneObject;
  nextHeight: number;
  nextWidth: number;
  pageHeight: number;
  pageWidth: number;
}) {
  if (!canResizeJournalObject(input.object)) {
    return input.object;
  }

  const minDimensions = getMinimumObjectDimensions(input.object.type);
  const maxWidth = Math.max(
    minDimensions.width,
    input.pageWidth - input.object.x,
  );
  const maxHeight = Math.max(
    minDimensions.height,
    input.pageHeight - input.object.y,
  );
  const width = clampDimension(input.nextWidth, minDimensions.width, maxWidth);
  const height = clampDimension(
    input.nextHeight,
    minDimensions.height,
    maxHeight,
  );

  if (width === input.object.width && height === input.object.height) {
    return input.object;
  }

  return {
    ...input.object,
    width,
    height,
  };
}

export function normalizeRotation(rotation: number) {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

export function getJournalObjectCenter(object: JournalSceneObject) {
  return {
    x: object.x + object.width / 2,
    y: object.y + object.height / 2,
  };
}

export function rotateJournalObjectFromPointer(input: {
  center: JournalPoint;
  currentPointer: JournalPoint;
  initialRotation: number;
  originPointer: JournalPoint;
}) {
  const originAngle = getPointAngleInDegrees(input.center, input.originPointer);
  const currentAngle = getPointAngleInDegrees(
    input.center,
    input.currentPointer,
  );

  return normalizeRotation(
    input.initialRotation + currentAngle - originAngle,
  );
}

export function areJournalScenesEqual(
  left: TripJournal | null,
  right: TripJournal | null,
) {
  if (!left || !right) {
    return false;
  }

  return serializeJournalScene(left) === serializeJournalScene(right);
}

export function areJournalObjectListsEqual(
  left: JournalSceneObject[],
  right: JournalSceneObject[],
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function serializeJournalScene(
  journal: Pick<TripJournal, "objects" | "page" | "sceneVersion">,
) {
  return JSON.stringify({
    objects: journal.objects,
    page: journal.page,
    sceneVersion: journal.sceneVersion,
  });
}

export function shouldAutosaveJournalScene(input: {
  activeFingerprint: string | null;
  isDirty: boolean;
  isPending: boolean;
  lastAutosaveFingerprint: string | null;
}) {
  return Boolean(
    input.activeFingerprint &&
    input.isDirty &&
    !input.isPending &&
    input.lastAutosaveFingerprint !== input.activeFingerprint,
  );
}

export function shouldReplaceDraftWithSavedScene(
  currentDraft: TripJournal | null,
  requestedFingerprint: string,
) {
  return (
    !currentDraft ||
    serializeJournalScene(currentDraft) === requestedFingerprint
  );
}

function getLayerOrderedObjects(objects: JournalSceneObject[]) {
  return [...objects].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return left.id.localeCompare(right.id);
  });
}

function getMinimumObjectDimensions(type: JournalSceneObject["type"]) {
  switch (type) {
    case "photo":
      return { width: 160, height: 120 };
    case "note":
    default:
      return { width: 180, height: 120 };
  }
}

function clampDimension(value: number, min: number, max: number) {
  const roundedValue = Math.round(value);

  return Math.min(Math.max(roundedValue, min), Math.max(min, max));
}

function getPointAngleInDegrees(center: JournalPoint, point: JournalPoint) {
  return (
    (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI
  );
}
