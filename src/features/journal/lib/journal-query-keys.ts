export const journalQueryKeys = {
  detail: (tripId: string) => ['trips', 'journal', tripId] as const,
};
