const PLANNER_COMPATIBILITY_PATH = '/app/planner';
const JOURNAL_COMPATIBILITY_PATH = '/app/journal';
const PLANNER_CANONICAL_SUFFIX = 'planner';
const JOURNAL_CANONICAL_SUFFIX = 'journal';

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

function buildTripCanonicalPath(
  tripId: string,
  suffix: string,
  search = '',
) {
  const searchParams = new URLSearchParams(search);

  searchParams.delete('tripId');

  const queryString = searchParams.toString();
  const pathname = `/app/trips/${encodeURIComponent(tripId)}/${suffix}`;

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildPlannerCompatibilityPath(tripId: string, search = '') {
  return buildTripCompatibilityPath(PLANNER_COMPATIBILITY_PATH, tripId, search);
}

export function buildJournalCompatibilityPath(tripId: string, search = '') {
  return buildTripCompatibilityPath(JOURNAL_COMPATIBILITY_PATH, tripId, search);
}

export function buildPlannerTripPath(tripId: string, search = '') {
  return buildTripCanonicalPath(tripId, PLANNER_CANONICAL_SUFFIX, search);
}

export function buildJournalTripPath(tripId: string, search = '') {
  return buildTripCanonicalPath(tripId, JOURNAL_CANONICAL_SUFFIX, search);
}
