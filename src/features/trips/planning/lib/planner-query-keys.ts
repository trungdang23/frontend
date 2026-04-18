export const plannerQueryKeys = {
  detail: (tripId: string) => ['trips', 'planner', tripId] as const,
};
