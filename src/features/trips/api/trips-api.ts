import { request, requestWithMeta } from '@/shared/api/http-client';
import { buildTripListQueryString, resolveTripListQuery } from '@/features/trips/lib/trip-query-params';
import {
  Trip,
  TripListMeta,
  TripListQuery,
  TripListResult,
  TripUpdatePayload,
  TripUpsertPayload,
} from '@/features/trips/types/trip';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function listTrips(
  query?: Partial<TripListQuery>,
  options: RequestOptions = {},
): Promise<TripListResult> {
  const resolvedQuery = resolveTripListQuery(query);
  const response = await requestWithMeta<Trip[], TripListMeta>(
    `/trips?${buildTripListQueryString(resolvedQuery)}`,
    {
      auth: true,
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

export async function getTripDetail(tripId: string, options: RequestOptions = {}) {
  return request<Trip>(`/trips/${tripId}`, {
    auth: true,
    signal: options.signal,
  });
}

export async function createTrip(payload: TripUpsertPayload) {
  return request<Trip, TripUpsertPayload>('/trips', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export async function updateTrip(tripId: string, payload: TripUpdatePayload) {
  return request<Trip, TripUpdatePayload>(`/trips/${tripId}`, {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export async function deleteTrip(tripId: string) {
  return request<void>(`/trips/${tripId}`, {
    method: 'DELETE',
    auth: true,
  });
}
