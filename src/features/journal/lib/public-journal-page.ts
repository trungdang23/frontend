import type { TripVisibility } from '@/features/trips/types/trip';

export function canShowPublicJournalPlannerLink(visibility: TripVisibility) {
  return visibility === 'public';
}
