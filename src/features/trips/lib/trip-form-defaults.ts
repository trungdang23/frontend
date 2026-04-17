import { Trip } from '@/features/trips/types/trip';
import { TripFormValues } from '@/features/trips/lib/trip-form-validators';

function getDefaultTimezone() {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return 'Asia/Ho_Chi_Minh';
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
}

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function getTripFormDefaults(trip?: Trip): TripFormValues {
  if (trip) {
    return {
      name: trip.name,
      destination: trip.destination,
      summaryNotes: trip.summaryNotes ?? '',
      coverImageUrl: trip.coverImageUrl ?? '',
      startDate: toDateInputValue(trip.startDate),
      endDate: toDateInputValue(trip.endDate),
      timezone: trip.timezone,
      budgetAmount: String(trip.budgetAmount),
      budgetCurrency: trip.budgetCurrency,
    };
  }

  return {
    name: '',
    destination: '',
    summaryNotes: '',
    coverImageUrl: '',
    startDate: '',
    endDate: '',
    timezone: getDefaultTimezone(),
    budgetAmount: '',
    budgetCurrency: 'VND',
  };
}
