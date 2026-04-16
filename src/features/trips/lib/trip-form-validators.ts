import { z } from 'zod';
import { TripUpsertPayload } from '@/features/trips/types/trip';

type Translate = (key: string) => string;

export type TripFormValues = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  budgetAmount: string;
  budgetCurrency: string;
};

export function createTripFormSchema(t: Translate) {
  return z
    .object({
      name: z.string().trim().min(1, t('trips.validation.nameRequired')),
      destination: z.string().trim().min(1, t('trips.validation.destinationRequired')),
      startDate: z.string().trim().min(1, t('trips.validation.startDateRequired')),
      endDate: z.string().trim().min(1, t('trips.validation.endDateRequired')),
      timezone: z.string().trim().min(1, t('trips.validation.timezoneRequired')),
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
    destination: values.destination.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    timezone: values.timezone.trim(),
    budgetAmount: Number(values.budgetAmount),
    budgetCurrency: values.budgetCurrency.trim().toUpperCase(),
  };
}
