import type { Trip } from "@/features/trips/types/trip";

export type JournalObjectType = "photo" | "sticker" | "note" | "tape";
export type JournalVisibility = "private" | "public";

export type JournalPage = {
  width: number;
  height: number;
  background: {
    style: string;
  };
};

export type JournalSceneObject = {
  id: string;
  type: JournalObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  props: Record<string, unknown>;
};

export type TripJournal = {
  id: string | null;
  tripId: string;
  sceneVersion: number;
  page: JournalPage;
  objects: JournalSceneObject[];
  visibility: JournalVisibility;
  createdAt: string;
  updatedAt: string;
};

export type TripJournalResult = {
  trip: Trip;
  journal: TripJournal;
};

export type TripJournalAsset = {
  id: string | null;
  tripId: string;
  fileName: string;
  contentType: string;
  byteSize: number;
  url: string;
  createdAt: string;
};

export type TripJournalAssetResult = {
  asset: TripJournalAsset;
};

export type TripJournalAssetListResult = {
  assets: TripJournalAsset[];
};

export type TripJournalRevision = {
  id: string;
  tripId: string;
  sceneVersion: number;
  objectCount: number;
  createdAt: string;
};

export type TripJournalRevisionListResult = {
  revisions: TripJournalRevision[];
};

export type SaveTripJournalPayload = {
  sceneVersion: number;
  page: JournalPage;
  objects: JournalSceneObject[];
};

export type UpdateTripJournalPayload = {
  visibility: JournalVisibility;
};
