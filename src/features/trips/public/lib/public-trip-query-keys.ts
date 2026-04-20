export const publicTripQueryKeys = {
  list: ['public', 'trips', 'list'] as const,
  detail: (tripId: string) => ['public', 'trips', 'detail', tripId] as const,
  planner: (tripId: string) => ['public', 'trips', 'planner', tripId] as const,
};
