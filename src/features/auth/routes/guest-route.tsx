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
    return <Navigate replace to={resolveGuestRedirectPath(location.state?.from?.pathname)} />;
  }

  return <>{children}</>;
}

function resolveGuestRedirectPath(nextPathname: unknown) {
  if (typeof nextPathname !== 'string' || nextPathname.length === 0) {
    return '/app';
  }

  return nextPathname.startsWith('/auth') ? '/app' : nextPathname;
}
