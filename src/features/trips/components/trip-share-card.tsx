import { PencilLine } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';

type TripShareCardProps = {
  trip: Pick<Trip, 'id' | 'visibility'>;
};

export function TripShareCard({ trip }: TripShareCardProps) {
  const { t } = useI18n();

  if (trip.visibility !== 'public') {
    return null;
  }

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-[rgba(84,107,65,0.16)] bg-[rgba(255,255,255,0.78)] p-5">
      <div className="space-y-2">
        <p className="eyebrow-text-xs text-[var(--color-forest)]">
          {t('trips.share.eyebrow')}
        </p>
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
          {t('trips.share.title')}
        </h2>
        <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
          {t('trips.share.description')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-forest)]"
          to={`/app/community/new?tripId=${trip.id}`}
        >
          <PencilLine className="h-4 w-4" />
          {t('trips.share.createPostAction')}
        </Link>
      </div>
    </div>
  );
}
