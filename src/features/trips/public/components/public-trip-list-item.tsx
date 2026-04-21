import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import {
  formatTripConfiguredBudget,
  formatTripDateRange,
  getTripBudgetModeLabel,
  getTripVisibilityLabel,
} from '@/features/trips/lib/trip-presenters';
import { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { getButtonClasses } from '@/shared/ui/button-styles';

type PublicTripListItemProps = {
  trip: Trip;
};

export function PublicTripListItem({ trip }: PublicTripListItemProps) {
  const { language, t } = useI18n();

  return (
    <Card className="group overflow-hidden p-0 motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_28px_80px_rgba(12,24,18,0.18)]">
      <Link
        aria-label={t('trips.publicList.actions.viewTrip')}
        className="block"
        to={`/trips/${trip.id}`}
      >
        <div className="relative h-56">
          <TripCoverImage
            alt={trip.name}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
            src={trip.coverImageUrl}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.14),rgba(12,24,18,0.76))]" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/72">
              {t('trips.publicList.cardEyebrow')}
            </p>
            <p className="mt-2 text-sm font-medium text-white/78">
              {formatTripDateRange(trip.startDate, trip.endDate, language)}
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              {trip.name}
            </h2>
          </div>
        </div>
      </Link>

      <div className="space-y-5 p-6">
        <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
          {trip.summaryNotes ?? t('trips.notesEmpty')}
        </p>

        <div className="grid gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
              {getTripVisibilityLabel(trip.visibility, t)}
            </span>
            <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
              {getTripBudgetModeLabel(trip.budgetMode, t)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow-text-xs text-[var(--color-forest)]">
              {t('trips.fields.budget')}
            </p>
            <p className="font-medium text-[var(--color-ink)]">
              {formatTripConfiguredBudget(trip, language, t)}
            </p>
          </div>
        </div>

        <Link className={getButtonClasses()} to={`/trips/${trip.id}`}>
          <span className="inline-flex items-center gap-2">
            {t('trips.publicList.actions.viewTrip')}
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </Card>
  );
}
