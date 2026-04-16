import { Trip } from '@/features/trips/types/trip';
import { TripListItem } from '@/features/trips/components/trip-list-item';

type TripListProps = {
  trips: Trip[];
};

export function TripList({ trips }: TripListProps) {
  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <TripListItem key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
