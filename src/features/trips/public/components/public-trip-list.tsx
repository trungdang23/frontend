import { Trip } from '@/features/trips/types/trip';
import { PublicTripListItem } from '@/features/trips/public/components/public-trip-list-item';

type PublicTripListProps = {
  trips: Trip[];
};

export function PublicTripList({ trips }: PublicTripListProps) {
  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <PublicTripListItem key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
