import { Language } from "@/shared/i18n/language-context";
import { Trip } from "@/features/trips/types/trip";

type Translate = (key: string) => string;

function getLocale(language: Language) {
  return language === "vi" ? "vi-VN" : "en-US";
}

export function formatTripDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatTripDateRange(
  startDate: string,
  endDate: string,
  language: Language,
) {
  return `${formatTripDate(startDate, language)} - ${formatTripDate(endDate, language)}`;
}

export function formatTripBudget(
  amount: number,
  currency: string,
  language: Language,
) {
  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(getLocale(language))} ${currency}`;
  }
}

export function formatTripConfiguredBudget(
  trip: Trip,
  language: Language,
  t: Translate,
) {
  if (
    trip.budgetMode === "manual" &&
    trip.manualBudgetAmount !== null &&
    trip.manualBudgetCurrency !== null
  ) {
    return formatTripBudget(
      trip.manualBudgetAmount,
      trip.manualBudgetCurrency,
      language,
    );
  }

  return t("trips.budget.autoLabel");
}

export function getTripBudgetModeLabel(
  budgetMode: Trip["budgetMode"],
  t: Translate,
) {
  return budgetMode === "manual"
    ? t("trips.budget.modeManual")
    : t("trips.budget.modeAuto");
}

export function getTripVisibilityLabel(
  visibility: Trip["visibility"],
  t: Translate,
) {
  return visibility === "public"
    ? t("trips.visibility.public")
    : t("trips.visibility.private");
}
