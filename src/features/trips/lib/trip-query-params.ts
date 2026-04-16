import { TripListQuery } from '@/features/trips/types/trip';

export const DEFAULT_TRIP_LIST_QUERY: TripListQuery = {
  page: 0,
  size: 20,
  sort: 'startDate,asc',
};

export function resolveTripListQuery(query?: Partial<TripListQuery>): TripListQuery {
  return {
    ...DEFAULT_TRIP_LIST_QUERY,
    ...query,
  };
}

export function buildTripListQueryString(query?: Partial<TripListQuery>) {
  const resolvedQuery = resolveTripListQuery(query);
  const searchParams = new URLSearchParams({
    page: String(resolvedQuery.page),
    size: String(resolvedQuery.size),
    sort: resolvedQuery.sort,
  });

  return searchParams.toString();
}
