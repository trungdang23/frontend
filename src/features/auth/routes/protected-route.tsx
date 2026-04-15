import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const auth = useAuth();
  const { t } = useI18n();

  if (auth.status === 'booting') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel rounded-[var(--radius-xl)] px-6 py-5 text-sm text-[var(--color-ink-soft)]">
          {t('auth.notices.booting')}
        </div>
      </main>
    );
  }

  if (auth.status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/auth/login" />;
  }

  return <>{children}</>;
}
