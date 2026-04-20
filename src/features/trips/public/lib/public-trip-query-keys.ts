export const publicTripQueryKeys = {
  detail: (tripId: string) => ['public', 'trips', 'detail', tripId] as const,
  planner: (tripId: string) => ['public', 'trips', 'planner', tripId] as const,
};
