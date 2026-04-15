import { AuthTokens } from '@/features/auth/api/auth-api';
import { User } from '@/shared/types/user';

export type StoredSession = {
  user: User | null;
  tokens: AuthTokens;
};

export type AuthStatus = 'booting' | 'guest' | 'authenticated';

export type AuthNoticeTone = 'danger' | 'info' | 'success';
