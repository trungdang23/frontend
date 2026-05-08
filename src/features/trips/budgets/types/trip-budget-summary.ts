export type TripBudgetSummaryCurrencyTotal = {
  currency: string;
  plannedAmount: number;
  nodeCount: number;
};

export type TripBudgetSummary = {
  tripId: string;
  currency: string;
  totalBudgetAmount: number;
  totalPlannedAmount: number;
  remainingAmount: number;
  totalDays: number;
  totalActivities: number;
  isOverBudget: boolean;
  hasMixedCurrencies: boolean;
  totalsByCurrency: TripBudgetSummaryCurrencyTotal[];
};
