import { Navigate, useParams } from 'react-router-dom';
import { TripPlannerWorkspace } from '@/features/trips/planning/components/trip-planner-workspace';

export function PlannerPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const resolvedTripId = tripId?.trim();

  return resolvedTripId ? (
    <TripPlannerWorkspace tripId={resolvedTripId} />
  ) : (
    <Navigate replace to="/app/trips/new" />
  );
}
