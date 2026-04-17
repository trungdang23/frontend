import { request } from '@/shared/api/http-client';
import {
  CreateItineraryActivityPayload,
  CreateItineraryDayPayload,
  TripBudgetSummary,
  TripItinerary,
  TripItineraryActivity,
  TripItineraryDay,
  UpdateItineraryActivityPayload,
  UpdateItineraryDayPayload,
} from '@/features/trips/types/trip-planning';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getTripItinerary(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripItinerary>(`/trips/${tripId}/itinerary`, {
    auth: true,
    signal: options.signal,
  });
}

export async function createItineraryDay(
  tripId: string,
  payload: CreateItineraryDayPayload,
) {
  return request<TripItineraryDay, CreateItineraryDayPayload>(
    `/trips/${tripId}/itinerary/days`,
    {
      method: 'POST',
      auth: true,
      body: payload,
    },
  );
}

export async function updateItineraryDay(
  tripId: string,
  dayId: string,
  payload: UpdateItineraryDayPayload,
) {
  return request<TripItineraryDay, UpdateItineraryDayPayload>(
    `/trips/${tripId}/itinerary/days/${dayId}`,
    {
      method: 'PATCH',
      auth: true,
      body: payload,
    },
  );
}

export async function deleteItineraryDay(tripId: string, dayId: string) {
  await request<void>(`/trips/${tripId}/itinerary/days/${dayId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createItineraryActivity(
  tripId: string,
  dayId: string,
  payload: CreateItineraryActivityPayload,
) {
  return request<TripItineraryActivity, CreateItineraryActivityPayload>(
    `/trips/${tripId}/itinerary/days/${dayId}/activities`,
    {
      method: 'POST',
      auth: true,
      body: payload,
    },
  );
}

export async function updateItineraryActivity(
  tripId: string,
  dayId: string,
  activityId: string,
  payload: UpdateItineraryActivityPayload,
) {
  return request<TripItineraryActivity, UpdateItineraryActivityPayload>(
    `/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`,
    {
      method: 'PATCH',
      auth: true,
      body: payload,
    },
  );
}

export async function deleteItineraryActivity(
  tripId: string,
  dayId: string,
  activityId: string,
) {
  await request<void>(
    `/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`,
    {
      method: 'DELETE',
      auth: true,
    },
  );
}

export async function getTripBudgetSummary(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripBudgetSummary>(`/trips/${tripId}/budget-summary`, {
    auth: true,
    signal: options.signal,
  });
}
