import { Link } from 'react-router-dom';
import { ArrowRight, PencilLine } from 'lucide-react';
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

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow-text text-[var(--color-forest)]">{trip.destination}</p>
          <div className="space-y-2">
            <h2 className="headline text-3xl text-[var(--color-ink)]">{trip.name}</h2>
            <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
              {formatTripDateRange(trip.startDate, trip.endDate, language)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm text-[var(--color-ink-soft)] sm:grid-cols-2 lg:min-w-[320px]">
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
    </Card>
  );
}
