import { Trip } from "@/features/trips/types/trip";
import { TripFormValues } from "@/features/trips/lib/trip-form-validators";

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function getTripFormDefaults(trip?: Trip): TripFormValues {
  if (trip) {
    return {
      name: trip.name,
      summaryNotes: trip.summaryNotes ?? "",
      coverImageUrl: trip.coverImageUrl ?? "",
      startDate: toDateInputValue(trip.startDate),
      endDate: toDateInputValue(trip.endDate),
      budgetMode: trip.budgetMode,
      manualBudgetAmount: trip.manualBudgetAmount?.toString() ?? "",
      manualBudgetCurrency: trip.manualBudgetCurrency ?? trip.budgetCurrency,
      visibility: trip.visibility,
    };
  }

  return {
    name: "",
    summaryNotes: "",
    coverImageUrl: "",
    startDate: "",
    endDate: "",
    budgetMode: "manual",
    manualBudgetAmount: "",
    manualBudgetCurrency: "VND",
    visibility: "private",
  };
}
