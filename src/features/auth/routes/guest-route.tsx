import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';

type GuestRouteProps = {
  children: React.ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const location = useLocation();
  const auth = useAuth();

  if (auth.status === 'booting') {
    return null;
  }

  if (auth.status === 'authenticated') {
    const next = location.state?.from?.pathname;
    return <Navigate replace to={next || '/app'} />;
  }

  return <>{children}</>;
}
