import {
  PropsWithChildren,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AuthSession,
  getCurrentUser,
  login as loginRequest,
  refreshTokens,
  register as registerRequest,
} from '@/features/auth/api/auth-api';
import {
  AuthNoticeTone,
  AuthStatus,
  StoredSession,
} from '@/features/auth/session/session-types';
import { AuthContext, AuthContextValue } from '@/features/auth/session/auth-context-value';
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from '@/features/auth/session/session-storage';
import { configureHttpClient, resetHttpClientConfig } from '@/shared/api/http-client';
import { User } from '@/shared/types/user';

function createStoredSession(session: AuthSession): StoredSession {
  return {
    user: session.user,
    tokens: session.tokens,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<AuthNoticeTone>('info');
  const sessionRef = useRef<StoredSession | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const setGuestState = useCallback(
    (nextNotice?: string, nextTone: AuthNoticeTone = 'info') => {
      sessionRef.current = null;
      clearStoredSession();
      startTransition(() => {
        setUser(null);
        setStatus('guest');
        setNotice(nextNotice || null);
        setNoticeTone(nextTone);
      });
    },
    [],
  );

  const syncAuthenticatedSession = useCallback((session: StoredSession) => {
    sessionRef.current = session;
    writeStoredSession(session);
    startTransition(() => {
      setUser(session.user);
      setStatus('authenticated');
      setNotice(null);
      setNoticeTone('info');
    });
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const activeSession = sessionRef.current;

    if (!activeSession?.tokens.refreshToken) {
      return null;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const { tokens } = await refreshTokens({
          refreshToken: activeSession.tokens.refreshToken,
        });

        const nextSession: StoredSession = {
          user: activeSession.user,
          tokens,
        };

        syncAuthenticatedSession(nextSession);
        return tokens.accessToken;
      } catch {
        setGuestState('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger');
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [setGuestState, syncAuthenticatedSession]);

  useEffect(() => {
    configureHttpClient({
      getAccessToken: () => sessionRef.current?.tokens.accessToken || null,
      onUnauthorized: () => setGuestState('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger'),
      refreshSession,
    });

    return () => {
      resetHttpClientConfig();
    };
  }, [refreshSession, setGuestState]);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      const storedSession = readStoredSession();

      if (!storedSession) {
        if (isMounted) {
          setStatus('guest');
        }
        return;
      }

      sessionRef.current = storedSession;
      setUser(storedSession.user);

      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        syncAuthenticatedSession({
          ...storedSession,
          user: currentUser.user,
        });
      } catch {
        const nextAccessToken = await refreshSession();

        if (!nextAccessToken) {
          if (isMounted) {
            setGuestState('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger');
          }
          return;
        }

        try {
          const currentUser = await getCurrentUser();

          if (!isMounted) {
            return;
          }

          syncAuthenticatedSession({
            ...(sessionRef.current as StoredSession),
            user: currentUser.user,
          });
        } catch {
          if (isMounted) {
            setGuestState('Không thể khôi phục phiên đăng nhập. Vui lòng thử lại.', 'danger');
          }
        }
      }
    }

    void boot();

    return () => {
      isMounted = false;
    };
  }, [refreshSession, setGuestState, syncAuthenticatedSession]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const session = await loginRequest(payload);
    syncAuthenticatedSession(createStoredSession(session));
  }, [syncAuthenticatedSession]);

  const register = useCallback(
    async (payload: { displayName: string; email: string; password: string }) => {
      const session = await registerRequest(payload);
      syncAuthenticatedSession(createStoredSession(session));
    },
    [syncAuthenticatedSession],
  );

  const logout = useCallback(() => {
    setGuestState('Bạn đã đăng xuất khỏi Journey.', 'success');
  }, [setGuestState]);

  const clearNotice = useCallback(() => {
    setNotice(null);
    setNoticeTone('info');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      notice,
      noticeTone,
      user,
      login,
      logout,
      register,
      clearNotice,
    }),
    [clearNotice, login, logout, notice, noticeTone, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
