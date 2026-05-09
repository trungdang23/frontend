import { request } from '@/shared/api/http-client';
import {
  PlanNode,
  PlanNodeMutationPayload,
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

export async function deletePlanNode(nodeId: string) {
  return request<void>(`/nodes/${nodeId}`, {
    method: 'DELETE',
    auth: true,
  });
}
