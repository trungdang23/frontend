import { Trip } from '@/features/trips/types/trip';

export const PLAN_NODE_TYPES = [
  'section',
  'day',
  'location',
  'activity',
  'note',
] as const;

export type PlanNodeType = (typeof PLAN_NODE_TYPES)[number];

export type PlanNode = {
  id: string;
  tripId: string;
  parentId: string | null;
  type: PlanNodeType;
  title: string;
  notes: string | null;
  startAt: string | null;
  endAt: string | null;
  costAmount: number | null;
  costCurrency: string | null;
  imageUrl: string | null;
  sortOrder: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
};

export type TripPlannerResult = {
  trip: Trip;
  nodes: PlanNode[];
};

export type PlanNodeStickerPlacement = {
  id: string;
  nodeId: string;
  stickerKey: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type PlanNodeStickerPlacementPayload = {
  id?: string;
  stickerKey: string;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
};

export type SavePlanNodeStickersPayload = {
  stickers: PlanNodeStickerPlacementPayload[];
};

export type PlanNodeMutationPayload = {
  tripId: string;
  parentId?: string | null;
  type: PlanNodeType;
  title: string;
  notes: string | null;
  startAt: string | null;
  endAt: string | null;
  costAmount: number | null;
  costCurrency: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type PlanNodeUpdatePayload = Partial<
  Omit<PlanNodeMutationPayload, 'tripId' | 'parentId' | 'sortOrder'>
> & {
  sortOrder?: number;
};

export type PlannerNodeFormValues = {
  type: PlanNodeType;
  title: string;
  notes: string;
  startAt: string;
  endAt: string;
  costAmount: string;
  costCurrency: string;
  imageUrl: string;
};
