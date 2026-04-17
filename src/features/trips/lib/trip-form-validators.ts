import { z } from 'zod';
import { TripUpsertPayload } from '@/features/trips/types/trip';

type Translate = (key: string) => string;

export type TripFormValues = {
  name: string;
  summaryNotes: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  budgetAmount: string;
  budgetCurrency: string;
};

export function createTripFormSchema(t: Translate) {
  return z
    .object({
      name: z.string().trim().min(1, t('trips.validation.nameRequired')),
      summaryNotes: z
        .string()
        .trim()
        .max(2000, t('trips.validation.summaryNotesLength')),
      coverImageUrl: z
        .string()
        .trim()
        .refine((value) => value.length === 0 || isHttpUrl(value), {
          message: t('trips.validation.coverImageUrlInvalid'),
        }),
      startDate: z.string().trim().min(1, t('trips.validation.startDateRequired')),
      endDate: z.string().trim().min(1, t('trips.validation.endDateRequired')),
      budgetAmount: z
        .string()
        .trim()
        .min(1, t('trips.validation.budgetAmountRequired'))
        .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
          message: t('trips.validation.budgetAmountPositive'),
        }),
      budgetCurrency: z
        .string()
        .trim()
        .min(1, t('trips.validation.budgetCurrencyRequired'))
        .refine((value) => value.length === 3, {
          message: t('trips.validation.budgetCurrencyLength'),
        }),
    })
    .superRefine((values, context) => {
      if (
        values.startDate &&
        values.endDate &&
        new Date(values.endDate).getTime() < new Date(values.startDate).getTime()
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('trips.validation.dateRangeInvalid'),
          path: ['endDate'],
        });
      }
    });
}

export function mapTripFormValuesToPayload(values: TripFormValues): TripUpsertPayload {
  return {
    name: values.name.trim(),
    summaryNotes: toNullableTrimmedValue(values.summaryNotes),
    coverImageUrl: toNullableTrimmedValue(values.coverImageUrl),
    startDate: values.startDate,
    endDate: values.endDate,
    budgetAmount: Number(values.budgetAmount),
    budgetCurrency: values.budgetCurrency.trim().toUpperCase(),
  };
}

function toNullableTrimmedValue(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function isHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}
