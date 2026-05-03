export const journalQueryKeys = {
  detail: (tripId: string) => ['trips', 'journal', tripId] as const,
  mine: () => ['trips', 'journal', 'mine'] as const,
};
