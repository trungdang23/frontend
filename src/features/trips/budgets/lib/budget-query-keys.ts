export const budgetQueryKeys = {
  detail: (tripId: string) => ['trips', 'budget-summary', tripId] as const,
};
