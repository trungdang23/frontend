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
    left.sceneVersion === right.sceneVersion &&
    JSON.stringify(left.page) === JSON.stringify(right.page) &&
    areJournalObjectListsEqual(left.objects, right.objects)
  );
}

export function areJournalObjectListsEqual(
  left: JournalSceneObject[],
  right: JournalSceneObject[],
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getLayerOrderedObjects(objects: JournalSceneObject[]) {
  return [...objects].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return left.id.localeCompare(right.id);
  });
}
