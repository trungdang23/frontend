import { request } from '@/shared/api/http-client';
import type {
  SaveTripJournalPayload,
  TripJournalResult,
} from '@/features/journal/types/journal';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getTripJournal(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripJournalResult>(`/trips/${tripId}/journal`, {
    auth: true,
    signal: options.signal,
  });
}

export async function getPublicTripJournal(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripJournalResult>(`/public/trips/${tripId}/journal`, {
    signal: options.signal,
  });
}

export async function listMyJournals(options: RequestOptions = {}) {
  return request<TripJournalResult[]>('/journals/mine', {
    auth: true,
    signal: options.signal,
  });
}

export async function saveTripJournal(
  tripId: string,
  payload: SaveTripJournalPayload,
) {
  return request<TripJournalResult, SaveTripJournalPayload>(
    `/trips/${tripId}/journal`,
    {
      method: 'PUT',
      auth: true,
      body: payload,
    },
  );
}

export async function deleteTripJournal(tripId: string) {
  return request<void>(`/trips/${tripId}/journal`, {
    method: 'DELETE',
    auth: true,
  });
}
