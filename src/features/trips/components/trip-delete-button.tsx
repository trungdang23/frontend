import { useState } from 'react';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';

type TripDeleteButtonProps = {
  disabled?: boolean;
  isDeleting?: boolean;
  onConfirm: () => Promise<void>;
  tripName: string;
};

export function TripDeleteButton({
  disabled = false,
  isDeleting = false,
  onConfirm,
  tripName,
}: TripDeleteButtonProps) {
  const { t } = useI18n();
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="space-y-4 rounded-[1.5rem] border border-[rgba(184,71,71,0.24)] bg-[rgba(184,71,71,0.06)] p-5">
        <div className="space-y-1">
          <p className="text-base font-semibold text-[var(--color-danger)]">{t('trips.delete.confirmTitle')}</p>
          <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
            {t('trips.delete.confirmDescription', { name: tripName })}
          </p>
          <p className="text-sm text-[var(--color-ink-soft)]">{t('trips.delete.confirmHint')}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full bg-[var(--color-danger)] hover:bg-[#9d3a3a] sm:w-auto"
            disabled={disabled || isDeleting}
            onClick={() => {
              void onConfirm();
            }}
            type="button"
          >
            {isDeleting ? t('trips.actions.deleting') : t('trips.actions.delete')}
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isDeleting}
            onClick={() => setIsConfirming(false)}
            type="button"
            variant="secondary"
          >
            {t('trips.actions.cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      className="w-full border-[rgba(184,71,71,0.24)] text-[var(--color-danger)] hover:border-[var(--color-danger)] sm:w-auto"
      disabled={disabled || isDeleting}
      onClick={() => setIsConfirming(true)}
      type="button"
      variant="secondary"
    >
      {t('trips.actions.delete')}
    </Button>
  );
}
