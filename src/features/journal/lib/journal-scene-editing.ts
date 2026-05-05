import type {
  JournalSceneObject,
  TripJournal,
} from '@/features/journal/types/journal';

export type JournalLayerDirection = 'backward' | 'forward';

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

  return direction === 'forward'
    ? objectIndex < objects.length - 1
    : objectIndex > 0;
}

export function moveObjectLayer(
  objects: JournalSceneObject[],
  objectId: string,
  direction: JournalLayerDirection,
) {
  const orderedObjects = getLayerOrderedObjects(objects);
  const objectIndex = orderedObjects.findIndex((object) => object.id === objectId);
  const targetIndex = direction === 'forward' ? objectIndex + 1 : objectIndex - 1;
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

export function normalizeRotation(rotation: number) {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

export function areJournalScenesEqual(
  left: TripJournal | null,
  right: TripJournal | null,
) {
  if (!left || !right) {
    return false;
  }

  return (
    serializeJournalScene(left) === serializeJournalScene(right)
  );
}

export function areJournalObjectListsEqual(
  left: JournalSceneObject[],
  right: JournalSceneObject[],
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function serializeJournalScene(
  journal: Pick<TripJournal, 'objects' | 'page' | 'sceneVersion'>,
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
