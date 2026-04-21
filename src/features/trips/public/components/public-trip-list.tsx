import { Trip } from '@/features/trips/types/trip';
import { PublicTripListItem } from '@/features/trips/public/components/public-trip-list-item';

type PublicTripListProps = {
  label: string;
  trips: Trip[];
};

export function PublicTripList({ label, trips }: PublicTripListProps) {
  return (
    <ul aria-label={label} className="space-y-4">
      {trips.map((trip) => (
        <li className="list-none" key={trip.id}>
          <PublicTripListItem trip={trip} />
        </li>
      ))}
    </ul>
  );
}
