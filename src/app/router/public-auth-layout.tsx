import { Outlet } from 'react-router-dom';
import { GuestRoute } from '@/features/auth/routes/guest-route';

export function PublicAuthLayout() {
  return (
    <GuestRoute>
      <Outlet />
    </GuestRoute>
  );
}
