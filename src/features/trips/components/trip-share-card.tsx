import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';

import type { Trip } from '@/features/trips/types/trip';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { StatusBanner } from '@/shared/ui/status-banner';

type TripShareCardProps = {
  trip: Pick<Trip, 'id' | 'visibility'>;
};

export function TripShareCard({ trip }: TripShareCardProps) {
  const { t } = useI18n();
  const [copyState, setCopyState] = useState<'success' | 'error' | null>(null);

  if (trip.visibility !== 'public') {
    return null;
  }

  const publicUrl = buildPublicTripUrl(trip.id);

  async function handleCopyLink() {
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== 'function'
      ) {
        throw new Error('Clipboard API is unavailable.');
      }

      await navigator.clipboard.writeText(publicUrl);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }
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

      {copyState === 'success' ? (
        <StatusBanner tone="success">
          {t('trips.share.copySuccess')}
        </StatusBanner>
      ) : null}

      {copyState === 'error' ? (
        <StatusBanner tone="danger">
          {t('trips.share.copyError')}
        </StatusBanner>
      ) : null}

      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/82 px-4 py-3">
        <p className="break-all text-sm leading-7 text-[var(--color-ink)]">
          {publicUrl}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void handleCopyLink()} type="button">
          <Copy className="h-4 w-4" />
          {t('trips.share.copyAction')}
        </Button>
        <a
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-forest)]"
          href={publicUrl}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          {t('trips.share.openAction')}
        </a>
      </div>
    </div>
  );
}

function buildPublicTripUrl(tripId: string) {
  if (typeof window === 'undefined') {
    return `/trips/${tripId}`;
  }

  return new URL(`/trips/${tripId}`, window.location.origin).toString();
}
