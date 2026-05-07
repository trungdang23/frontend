import { describe, expect, it } from "vitest";
import {
  areJournalScenesEqual,
  canResizeJournalObject,
  canMoveObjectLayer,
  canRotateJournalObject,
  getJournalObjectCenter,
  moveObjectLayer,
  normalizeRotation,
  resizeJournalObject,
  rotateJournalObjectFromPointer,
  serializeJournalScene,
  shouldAutosaveJournalScene,
  shouldReplaceDraftWithSavedScene,
} from "@/features/journal/lib/journal-scene-editing";
import type {
  JournalSceneObject,
  TripJournal,
} from "@/features/journal/types/journal";

const baseObjects: JournalSceneObject[] = [
  createObject("note-1", 1),
  createObject("photo-1", 4),
  createObject("tape-1", 7),
];

describe("journal scene editing helpers", () => {
  it("swaps z-index with the adjacent layer when moving objects", () => {
    const movedForward = moveObjectLayer(baseObjects, "photo-1", "forward");
    const movedBackward = moveObjectLayer(baseObjects, "photo-1", "backward");

    expect(movedForward.find((object) => object.id === "photo-1")?.zIndex).toBe(
      7,
    );
    expect(movedForward.find((object) => object.id === "tape-1")?.zIndex).toBe(
      4,
    );
    expect(
      movedBackward.find((object) => object.id === "photo-1")?.zIndex,
    ).toBe(1);
    expect(movedBackward.find((object) => object.id === "note-1")?.zIndex).toBe(
      4,
    );
  });

  it("reports layer movement availability from the current stack", () => {
    expect(canMoveObjectLayer(baseObjects, "note-1", "backward")).toBe(false);
    expect(canMoveObjectLayer(baseObjects, "note-1", "forward")).toBe(true);
    expect(canMoveObjectLayer(baseObjects, "tape-1", "forward")).toBe(false);
  });

  it("only exposes resize for note and photo objects that are not locked", () => {
    expect(canResizeJournalObject(createObject("note-2", 2))).toBe(true);
    expect(
      canResizeJournalObject({
        ...createObject("photo-2", 2),
        type: "photo",
      }),
    ).toBe(true);
    expect(
      canResizeJournalObject({
        ...createObject("sticker-1", 2),
        type: "sticker",
      }),
    ).toBe(false);
    expect(
      canResizeJournalObject({
        ...createObject("note-3", 2),
        locked: true,
      }),
    ).toBe(false);
  });

  it("exposes direct rotation for unlocked objects", () => {
    expect(canRotateJournalObject(createObject("note-rotate", 2))).toBe(true);
    expect(
      canRotateJournalObject({
        ...createObject("locked-note", 2),
        locked: true,
      }),
    ).toBe(false);
  });

  it("clamps resized objects to page bounds and minimum dimensions", () => {
    const resized = resizeJournalObject({
      nextHeight: 999,
      nextWidth: 999,
      object: {
        ...createObject("photo-3", 3),
        height: 200,
        type: "photo",
        width: 300,
        x: 900,
        y: 1400,
      },
      pageHeight: 1600,
      pageWidth: 1200,
    });

    expect(resized.width).toBe(300);
    expect(resized.height).toBe(200);

    const shrunk = resizeJournalObject({
      nextHeight: 10,
      nextWidth: 20,
      object: createObject("note-4", 4),
      pageHeight: 1600,
      pageWidth: 1200,
    });

    expect(shrunk.width).toBe(180);
    expect(shrunk.height).toBe(120);
  });

  it("normalizes rotation into a stable signed range", () => {
    expect(normalizeRotation(188)).toBe(-172);
    expect(normalizeRotation(-188)).toBe(172);
  });

  it("calculates direct pointer rotation around the object center", () => {
    const object = {
      ...createObject("photo-rotate", 2),
      height: 200,
      rotation: 170,
      width: 300,
      x: 100,
      y: 200,
    };
    const center = getJournalObjectCenter(object);

    expect(center).toEqual({ x: 250, y: 300 });
    expect(
      rotateJournalObjectFromPointer({
        center,
        currentPointer: { x: 250, y: 100 },
        initialRotation: 0,
        originPointer: { x: 450, y: 300 },
      }),
    ).toBe(-90);
    expect(
      rotateJournalObjectFromPointer({
        center,
        currentPointer: { x: 250, y: 100 },
        initialRotation: object.rotation,
        originPointer: { x: 450, y: 300 },
      }),
    ).toBe(80);
  });

  it("compares scene payload without treating updatedAt as dirty state", () => {
    const left = createJournal("2026-05-05T08:00:00.000Z");
    const right = createJournal("2026-05-05T09:00:00.000Z");

    expect(areJournalScenesEqual(left, right)).toBe(true);
    expect(
      areJournalScenesEqual(left, {
        ...right,
        objects: [
          {
            ...right.objects[0],
            x: 16,
          },
        ],
      }),
    ).toBe(false);
  });

  it("serializes the scene payload without timestamps or visibility noise", () => {
    const left = createJournal("2026-05-05T08:00:00.000Z");
    const right = {
      ...createJournal("2026-05-05T09:00:00.000Z"),
      visibility: "public" as const,
    };

    expect(serializeJournalScene(left)).toBe(serializeJournalScene(right));
  });

  it("schedules autosave only when the scene is dirty and not already requested", () => {
    expect(
      shouldAutosaveJournalScene({
        activeFingerprint: "scene-1",
        isDirty: true,
        isPending: false,
        lastAutosaveFingerprint: null,
      }),
    ).toBe(true);
    expect(
      shouldAutosaveJournalScene({
        activeFingerprint: "scene-1",
        isDirty: true,
        isPending: true,
        lastAutosaveFingerprint: null,
      }),
    ).toBe(false);
    expect(
      shouldAutosaveJournalScene({
        activeFingerprint: "scene-1",
        isDirty: false,
        isPending: false,
        lastAutosaveFingerprint: null,
      }),
    ).toBe(false);
    expect(
      shouldAutosaveJournalScene({
        activeFingerprint: "scene-1",
        isDirty: true,
        isPending: false,
        lastAutosaveFingerprint: "scene-1",
      }),
    ).toBe(false);
  });

  it("keeps a newer local draft when an older save response resolves", () => {
    const currentDraft = createJournal("2026-05-05T09:00:00.000Z");
    const requestedFingerprint = serializeJournalScene(currentDraft);
    const newerDraft = {
      ...currentDraft,
      objects: [...currentDraft.objects, createObject("note-2", 2)],
    };

    expect(
      shouldReplaceDraftWithSavedScene(currentDraft, requestedFingerprint),
    ).toBe(true);
    expect(
      shouldReplaceDraftWithSavedScene(newerDraft, requestedFingerprint),
    ).toBe(false);
  });
});

function createObject(id: string, zIndex: number): JournalSceneObject {
  return {
    height: 100,
    id,
    locked: false,
    props: {},
    rotation: 0,
    type: "note",
    width: 100,
    x: 8,
    y: 12,
    zIndex,
  };
}

function createJournal(updatedAt: string): TripJournal {
  return {
    createdAt: "2026-05-05T07:00:00.000Z",
    id: "journal-1",
    objects: [createObject("note-1", 1)],
    page: {
      background: {
        style: "paper-cream",
      },
      height: 1600,
      width: 1200,
    },
    sceneVersion: 1,
    tripId: "trip-1",
    updatedAt,
    visibility: "private",
  };
}
