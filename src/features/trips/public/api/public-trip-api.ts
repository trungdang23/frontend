import { request, requestWithMeta } from '@/shared/api/http-client';
import { Trip } from '@/features/trips/types/trip';
import { buildTripListQueryString, resolveTripListQuery } from '@/features/trips/lib/trip-query-params';
import { TripPlannerResult } from '@/features/trips/planning/types/plan-node';
import { TripListMeta, TripListQuery, TripListResult } from '@/features/trips/types/trip';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function listPublicTrips(
  query?: Partial<TripListQuery>,
  options: RequestOptions = {},
): Promise<TripListResult> {
  const resolvedQuery = resolveTripListQuery(query);
  const response = await requestWithMeta<Trip[], TripListMeta>(
    `/public/trips?${buildTripListQueryString(resolvedQuery)}`,
    {
      signal: options.signal,
    },
  );

  return {
    data: response.data,
    meta: response.meta || {
      page: resolvedQuery.page,
      size: resolvedQuery.size,
      sort: resolvedQuery.sort,
      totalElements: response.data.length,
      totalPages: response.data.length > 0 ? 1 : 0,
    },
  };
}

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

export async function copyPublicTripPlanner(tripId: string) {
  return request<TripPlannerResult>(`/public/trips/${tripId}/copy`, {
    auth: true,
    method: 'POST',
  });
}
