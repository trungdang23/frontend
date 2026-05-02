const PLANNER_COMPATIBILITY_PATH = '/app/planner';
const JOURNAL_COMPATIBILITY_PATH = '/app/journal';

function buildTripCompatibilityPath(
  pathname: string,
  tripId: string,
  search = '',
) {
  const searchParams = new URLSearchParams(search);

  searchParams.set('tripId', tripId);

  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildPlannerCompatibilityPath(tripId: string, search = '') {
  return buildTripCompatibilityPath(PLANNER_COMPATIBILITY_PATH, tripId, search);
}

export function buildJournalCompatibilityPath(tripId: string, search = '') {
  return buildTripCompatibilityPath(JOURNAL_COMPATIBILITY_PATH, tripId, search);
}
