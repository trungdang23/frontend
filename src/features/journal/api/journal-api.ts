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
