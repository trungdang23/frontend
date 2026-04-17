import { request } from '@/shared/api/http-client';
import {
  CreateItineraryActivityPayload,
  CreateItineraryDayPayload,
  TripBudgetSummary,
  TripItinerary,
  TripItineraryActivity,
  TripItineraryDay,
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

export async function getTripBudgetSummary(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripBudgetSummary>(`/trips/${tripId}/budget-summary`, {
    auth: true,
    signal: options.signal,
  });
}
