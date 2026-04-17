import { Trip } from '@/features/trips/types/trip';
import { TripFormValues } from '@/features/trips/lib/trip-form-validators';

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function getTripFormDefaults(trip?: Trip): TripFormValues {
  if (trip) {
    return {
      name: trip.name,
      summaryNotes: trip.summaryNotes ?? '',
      coverImageUrl: trip.coverImageUrl ?? '',
      startDate: toDateInputValue(trip.startDate),
      endDate: toDateInputValue(trip.endDate),
      budgetAmount: String(trip.budgetAmount),
      budgetCurrency: trip.budgetCurrency,
    };
  }

  return {
    name: '',
    summaryNotes: '',
    coverImageUrl: '',
    startDate: '',
    endDate: '',
    budgetAmount: '',
    budgetCurrency: 'VND',
  };
}
