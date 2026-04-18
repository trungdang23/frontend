import { z } from "zod";
import { TripUpsertPayload } from "@/features/trips/types/trip";

type Translate = (key: string) => string;

export type TripFormValues = {
  name: string;
  summaryNotes: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  budgetMode: "auto" | "manual";
  manualBudgetAmount: string;
  manualBudgetCurrency: string;
  visibility: "private" | "public";
};

export function createTripFormSchema(t: Translate) {
  return z
    .object({
      name: z.string().trim().min(1, t("trips.validation.nameRequired")),
      summaryNotes: z
        .string()
        .trim()
        .max(2000, t("trips.validation.summaryNotesLength")),
      coverImageUrl: z
        .string()
        .trim()
        .refine((value) => value.length === 0 || isHttpUrl(value), {
          message: t("trips.validation.coverImageUrlInvalid"),
        }),
      startDate: z
        .string()
        .trim()
        .min(1, t("trips.validation.startDateRequired")),
      endDate: z.string().trim().min(1, t("trips.validation.endDateRequired")),
      budgetMode: z.enum(["auto", "manual"]),
      manualBudgetAmount: z.string().trim(),
      manualBudgetCurrency: z.string().trim(),
      visibility: z.enum(["private", "public"]),
    })
    .superRefine((values, context) => {
      if (
        values.startDate &&
        values.endDate &&
        new Date(values.endDate).getTime() <
          new Date(values.startDate).getTime()
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("trips.validation.dateRangeInvalid"),
          path: ["endDate"],
        });
      }

      if (values.budgetMode === "manual") {
        if (values.manualBudgetAmount.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("trips.validation.manualBudgetAmountRequired"),
            path: ["manualBudgetAmount"],
          });
        } else if (
          !Number.isFinite(Number(values.manualBudgetAmount)) ||
          Number(values.manualBudgetAmount) < 0
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("trips.validation.manualBudgetAmountPositive"),
            path: ["manualBudgetAmount"],
          });
        }

        if (values.manualBudgetCurrency.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("trips.validation.manualBudgetCurrencyRequired"),
            path: ["manualBudgetCurrency"],
          });
        } else if (values.manualBudgetCurrency.length !== 3) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("trips.validation.manualBudgetCurrencyLength"),
            path: ["manualBudgetCurrency"],
          });
        }
      }
    });
}

export function mapTripFormValuesToPayload(
  values: TripFormValues,
): TripUpsertPayload {
  const manualBudgetAmount =
    values.budgetMode === "manual" ? Number(values.manualBudgetAmount) : null;
  const manualBudgetCurrency =
    values.budgetMode === "manual"
      ? values.manualBudgetCurrency.trim().toUpperCase()
      : null;

  return {
    name: values.name.trim(),
    summaryNotes: toNullableTrimmedValue(values.summaryNotes),
    coverImageUrl: toNullableTrimmedValue(values.coverImageUrl),
    startDate: values.startDate,
    endDate: values.endDate,
    budgetMode: values.budgetMode,
    manualBudgetAmount,
    manualBudgetCurrency,
    visibility: values.visibility,
  };
}

function toNullableTrimmedValue(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function isHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}
