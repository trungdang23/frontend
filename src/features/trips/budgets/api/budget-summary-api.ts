import { request } from '@/shared/api/http-client';
import type { TripBudgetSummary } from '@/features/trips/budgets/types/trip-budget-summary';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getTripBudgetSummary(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripBudgetSummary>(`/trips/${tripId}/budget-summary`, {
    auth: true,
    signal: options.signal,
  });
}
