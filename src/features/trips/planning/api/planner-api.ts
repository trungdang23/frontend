import { request } from '@/shared/api/http-client';
import {
  PlanNode,
  PlanNodeMutationPayload,
  PlanNodeStickerPlacement,
  SavePlanNodeStickersPayload,
  PlanNodeUpdatePayload,
  TripPlannerResult,
} from '@/features/trips/planning/types/plan-node';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getTripPlanner(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripPlannerResult>(`/trips/${tripId}/planner`, {
    auth: true,
    signal: options.signal,
  });
}

export async function createPlanNode(payload: PlanNodeMutationPayload) {
  return request<PlanNode, PlanNodeMutationPayload>('/nodes', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export async function updatePlanNode(
  nodeId: string,
  payload: PlanNodeUpdatePayload,
) {
  return request<PlanNode, PlanNodeUpdatePayload>(`/nodes/${nodeId}`, {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export async function getPlanNodeStickers(
  nodeId: string,
  options: RequestOptions = {},
) {
  return request<PlanNodeStickerPlacement[]>(`/nodes/${nodeId}/stickers`, {
    auth: true,
    signal: options.signal,
  });
}

export async function savePlanNodeStickers(
  nodeId: string,
  payload: SavePlanNodeStickersPayload,
) {
  return request<PlanNodeStickerPlacement[], SavePlanNodeStickersPayload>(
    `/nodes/${nodeId}/stickers`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
    },
  );
}

export async function deletePlanNode(nodeId: string) {
  return request<void>(`/nodes/${nodeId}`, {
    method: 'DELETE',
    auth: true,
  });
}
