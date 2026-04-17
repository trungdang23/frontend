import { Link } from 'react-router-dom';
import { ArrowRight, PencilLine } from 'lucide-react';
import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import { getTripSummaryPreview } from '@/features/trips/lib/trip-media';
import { formatTripBudget, formatTripDateRange } from '@/features/trips/lib/trip-presenters';
import { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { getButtonClasses } from '@/shared/ui/button-styles';

type TripListItemProps = {
  trip: Trip;
};

export function TripListItem({ trip }: TripListItemProps) {
  const { language, t } = useI18n();
  const summaryPreview = getTripSummaryPreview(trip.summaryNotes);

  return (
    <Card className="group overflow-hidden p-0 motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_28px_80px_rgba(12,24,18,0.18)]">
      <div className="relative h-56">
        <TripCoverImage
          alt={trip.name}
          className="absolute inset-0"
          imgClassName="h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
          src={trip.coverImageUrl}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.14),rgba(12,24,18,0.76))]" />
        <div className="absolute left-5 top-5 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
          {trip.destination}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
          <p className="text-sm font-medium text-white/78">
            {formatTripDateRange(trip.startDate, trip.endDate, language)}
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight">{trip.name}</h2>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {summaryPreview ? (
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{summaryPreview}</p>
        ) : (
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('trips.listCardFallback')}
          </p>
        )}

        <div className="grid gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm text-[var(--color-ink-soft)] sm:grid-cols-2">
          <div>
            <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.timezone')}</p>
            <p className="mt-1 font-medium text-[var(--color-ink)]">{trip.timezone}</p>
          </div>
          <div>
            <p className="eyebrow-text-xs text-[var(--color-forest)]">{t('trips.fields.budget')}</p>
            <p className="mt-1 font-medium text-[var(--color-ink)]">
              {formatTripBudget(trip.budgetAmount, trip.budgetCurrency, language)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className={getButtonClasses()} to={`/app/trips/${trip.id}`}>
            <span className="inline-flex items-center gap-2">
              {t('trips.actions.viewDetails')}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link className={getButtonClasses('secondary')} to={`/app/trips/${trip.id}/edit`}>
            <span className="inline-flex items-center gap-2">
              {t('trips.actions.edit')}
              <PencilLine className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
