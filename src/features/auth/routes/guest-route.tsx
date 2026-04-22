import { Navigate, useLocation } from 'react-router-dom';
import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path';
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
    return <Navigate replace to={resolvePostAuthPath(location.state?.from?.pathname)} />;
  }

  return <>{children}</>;
}
