import { ProtectedRoute } from '@/features/auth/routes/protected-route';
import { AppShell } from '@/features/shell/routes/app-shell';

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}
