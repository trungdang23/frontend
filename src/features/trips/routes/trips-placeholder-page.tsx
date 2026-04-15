import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/empty-state';

export function TripsPlaceholderPage() {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <EmptyState
      action={
        <Link className={getButtonClasses()} to="/app">
          <span className="inline-flex items-center gap-2">
            {t('common.actions.backToDashboard')}
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      }
      description={t('trips.blockedDescription', { path: location.pathname })}
      eyebrow={t('trips.blockedEyebrow')}
      title={t('trips.blockedTitle')}
    />
  );
}
