import type {
  Trip,
  TripBudgetMode,
  TripUpsertPayload,
  TripVisibility,
} from '@/features/trips/types/trip';

export type TripFormDraft = {
  name: string;
  destination: string;
  summaryNotes: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  budgetMode: TripBudgetMode;
  manualBudgetAmount: string;
  manualBudgetCurrency: string;
  visibility: TripVisibility;
};

export type TripFormDraftField = keyof TripFormDraft;
export type TripFormDraftErrors = Partial<Record<TripFormDraftField, string>>;
export type TripFormChangeHandler = <Field extends TripFormDraftField>(
  field: Field,
  value: TripFormDraft[Field],
) => void;
export type TripFormTranslate = (key: string, values?: Record<string, number | string>) => string;

export function createDefaultTripFormDraft(): TripFormDraft {
  return {
    name: '',
    destination: '',
    summaryNotes: '',
    coverImageUrl: '',
    startDate: '',
    endDate: '',
    budgetMode: 'auto',
    manualBudgetAmount: '',
    manualBudgetCurrency: 'VND',
    visibility: 'private',
  };
}

export function buildTripFormDraftFromTrip(trip: Trip): TripFormDraft {
  return {
    name: trip.name,
    destination: trip.destination ?? '',
    summaryNotes: trip.summaryNotes ?? '',
    coverImageUrl: trip.coverImageUrl ?? '',
    startDate: trip.startDate,
    endDate: trip.endDate,
    budgetMode: trip.budgetMode,
    manualBudgetAmount: trip.manualBudgetAmount === null ? '' : String(trip.manualBudgetAmount),
    manualBudgetCurrency: trip.manualBudgetCurrency ?? 'VND',
    visibility: trip.visibility,
  };
}

export function buildTripUpsertPayload(draft: TripFormDraft): TripUpsertPayload {
  const isManualBudget = draft.budgetMode === 'manual';

  return {
    name: draft.name.trim(),
    destination: toNullableTrimmedValue(draft.destination),
    summaryNotes: toNullableTrimmedValue(draft.summaryNotes),
    coverImageUrl: toNullableTrimmedValue(draft.coverImageUrl),
    startDate: draft.startDate,
    endDate: draft.endDate,
    budgetMode: draft.budgetMode,
    manualBudgetAmount: isManualBudget ? Number(draft.manualBudgetAmount.trim()) : null,
    manualBudgetCurrency: isManualBudget ? draft.manualBudgetCurrency.trim().toUpperCase() : null,
    visibility: draft.visibility,
  };
}

export function validateTripFormDraft(
  draft: TripFormDraft,
  t: TripFormTranslate,
): TripFormDraftErrors {
  const nextErrors: TripFormDraftErrors = {};
  const coverImageUrl = draft.coverImageUrl.trim();
  const summaryNotes = draft.summaryNotes.trim();
  const manualBudgetAmount = draft.manualBudgetAmount.trim();
  const manualBudgetAmountNumber = Number(manualBudgetAmount);
  const manualBudgetCurrency = draft.manualBudgetCurrency.trim();

  if (!draft.name.trim()) {
    nextErrors.name = t('trips.validation.nameRequired');
  }

  if (!draft.startDate) {
    nextErrors.startDate = t('trips.validation.startDateRequired');
  }

  if (!draft.endDate) {
    nextErrors.endDate = t('trips.validation.endDateRequired');
  }

  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    nextErrors.endDate = t('trips.validation.dateRangeInvalid');
  }

  if (summaryNotes.length > 2000) {
    nextErrors.summaryNotes = t('trips.validation.summaryNotesLength');
  }

  if (coverImageUrl && !isValidHttpUrl(coverImageUrl)) {
    nextErrors.coverImageUrl = t('trips.validation.coverImageUrlInvalid');
  }

  if (draft.budgetMode === 'manual') {
    if (!manualBudgetAmount) {
      nextErrors.manualBudgetAmount = t('trips.validation.manualBudgetAmountRequired');
    } else if (!Number.isFinite(manualBudgetAmountNumber) || manualBudgetAmountNumber < 0) {
      nextErrors.manualBudgetAmount = t('trips.validation.manualBudgetAmountPositive');
    }

    if (!manualBudgetCurrency) {
      nextErrors.manualBudgetCurrency = t('trips.validation.manualBudgetCurrencyRequired');
    } else if (manualBudgetCurrency.length !== 3) {
      nextErrors.manualBudgetCurrency = t('trips.validation.manualBudgetCurrencyLength');
    }
  }

  return nextErrors;
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function toNullableTrimmedValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}
