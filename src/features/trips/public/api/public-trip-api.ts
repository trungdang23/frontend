import { request } from '@/shared/api/http-client';
import { Trip } from '@/features/trips/types/trip';
import { TripPlannerResult } from '@/features/trips/planning/types/plan-node';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getPublicTripDetail(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<Trip>(`/public/trips/${tripId}`, {
    signal: options.signal,
  });
}

export async function getPublicTripPlanner(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripPlannerResult>(`/public/trips/${tripId}/planner`, {
    signal: options.signal,
  });
}
