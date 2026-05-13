export const journalQueryKeys = {
  assets: (tripId: string) => ["trips", "journal", tripId, "assets"] as const,
  detail: (tripId: string) => ["trips", "journal", tripId] as const,
  mine: () => ["trips", "journal", "mine"] as const,
  publicList: () => ["public", "journals", "list"] as const,
  publicDetail: (tripId: string) =>
    ["public", "trips", "journal", tripId] as const,
  revisions: (tripId: string) =>
    ["trips", "journal", tripId, "revisions"] as const,
};
