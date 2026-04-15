import { useContext } from 'react';
import { AuthContext } from '@/features/auth/session/auth-context-value';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
