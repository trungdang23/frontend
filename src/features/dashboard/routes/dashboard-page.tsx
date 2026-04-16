import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function DashboardPage() {
  const auth = useAuth();
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <Card className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="eyebrow-text text-[var(--color-forest)]">{t('dashboard.eyebrow')}</p>
          <div className="space-y-3">
            <h1 className="headline text-4xl text-[var(--color-ink)]">
              {t('dashboard.title', { name: auth.user?.displayName || t('common.userFallback') })}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">{t('dashboard.description')}</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.94),rgba(153,173,122,0.74))] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="eyebrow-text text-white/72">{t('dashboard.nextActionEyebrow')}</p>
          <h2 className="headline mt-3 text-3xl">{t('dashboard.nextActionTitle')}</h2>
          <p className="mt-3 text-sm leading-7 text-white/78">{t('dashboard.nextActionDescription')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--color-forest)] transition hover:bg-[rgba(255,255,255,0.88)]"
              to="/app/trips/new"
            >
              <Plus className="h-4 w-4" />
              {t('common.actions.createFirstTrip')}
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              to="/app/trips"
            >
              <ArrowRight className="h-4 w-4" />
              {t('trips.actions.viewList')}
            </Link>
          </div>
        </div>
      </Card>

      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/profile">
            <span className="inline-flex items-center gap-2">
              {t('common.actions.viewCurrentProfile')}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        }
        description={t('dashboard.emptyDescription')}
        eyebrow={t('dashboard.emptyEyebrow')}
        title={t('dashboard.emptyTitle')}
      />
    </div>
  );
}
