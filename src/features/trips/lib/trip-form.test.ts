import { describe, expect, it } from 'vitest';
import {
  buildTripFormDraftFromTrip,
  buildTripUpsertPayload,
  createDefaultTripFormDraft,
  validateTripFormDraft,
} from '@/features/trips/lib/trip-form';
import type { Trip } from '@/features/trips/types/trip';

const tripMessages: Record<string, string> = {
  'trips.validation.coverImageUrlInvalid': 'cover invalid',
  'trips.validation.dateRangeInvalid': 'date invalid',
  'trips.validation.endDateRequired': 'end required',
  'trips.validation.manualBudgetAmountPositive': 'budget invalid',
  'trips.validation.manualBudgetAmountRequired': 'budget required',
  'trips.validation.manualBudgetCurrencyLength': 'currency length',
  'trips.validation.manualBudgetCurrencyRequired': 'currency required',
  'trips.validation.nameRequired': 'name required',
  'trips.validation.startDateRequired': 'start required',
  'trips.validation.summaryNotesLength': 'summary length',
};

function t(key: string) {
  return tripMessages[key] ?? key;
}

describe('trip form helpers', () => {
  it('creates a stable default trip draft', () => {
    expect(createDefaultTripFormDraft()).toEqual({
      budgetMode: 'auto',
      coverImageUrl: '',
      destination: '',
      endDate: '',
      manualBudgetAmount: '',
      manualBudgetCurrency: 'VND',
      name: '',
      startDate: '',
      summaryNotes: '',
      visibility: 'private',
    });
  });

  it('maps a saved trip into the editable draft shape', () => {
    const trip: Trip = {
      budgetAmount: 0,
      budgetCurrency: 'VND',
      budgetMode: 'manual',
      coverImageUrl: null,
      createdAt: '2026-05-08T08:00:00.000Z',
      destination: null,
      endDate: '2026-06-05',
      id: 'trip-1',
      manualBudgetAmount: 5000000,
      manualBudgetCurrency: 'usd',
      name: 'Da Nang',
      startDate: '2026-06-01',
      summaryNotes: null,
      timezone: null,
      updatedAt: '2026-05-08T08:00:00.000Z',
      userId: 'user-1',
      visibility: 'public',
    };

    expect(buildTripFormDraftFromTrip(trip)).toEqual({
      budgetMode: 'manual',
      coverImageUrl: '',
      destination: '',
      endDate: '2026-06-05',
      manualBudgetAmount: '5000000',
      manualBudgetCurrency: 'usd',
      name: 'Da Nang',
      startDate: '2026-06-01',
      summaryNotes: '',
      visibility: 'public',
    });
  });

  it('builds a trimmed upsert payload for manual budgets', () => {
    expect(buildTripUpsertPayload({
      budgetMode: 'manual',
      coverImageUrl: ' https://example.com/cover.jpg ',
      destination: ' Hoi An ',
      endDate: '2026-06-05',
      manualBudgetAmount: ' 2500000 ',
      manualBudgetCurrency: ' usd ',
      name: ' Summer central trip ',
      startDate: '2026-06-01',
      summaryNotes: ' slow days only ',
      visibility: 'public',
    })).toEqual({
      budgetMode: 'manual',
      coverImageUrl: 'https://example.com/cover.jpg',
      destination: 'Hoi An',
      endDate: '2026-06-05',
      manualBudgetAmount: 2500000,
      manualBudgetCurrency: 'USD',
      name: 'Summer central trip',
      startDate: '2026-06-01',
      summaryNotes: 'slow days only',
      visibility: 'public',
    });
  });

  it('rejects invalid manual budget, date range, and cover url input', () => {
    expect(validateTripFormDraft({
      budgetMode: 'manual',
      coverImageUrl: 'ftp://example.com/cover.jpg',
      destination: '',
      endDate: '2026-06-01',
      manualBudgetAmount: 'not-a-number',
      manualBudgetCurrency: 'VNDD',
      name: '',
      startDate: '2026-06-05',
      summaryNotes: '',
      visibility: 'private',
    }, t)).toEqual({
      coverImageUrl: 'cover invalid',
      endDate: 'date invalid',
      manualBudgetAmount: 'budget invalid',
      manualBudgetCurrency: 'currency length',
      name: 'name required',
    });
  });
});
