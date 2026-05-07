import {
  PropsWithChildren,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AuthSession,
  deleteCurrentUserAvatar,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshTokens,
  register as registerRequest,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from "@/features/auth/api/auth-api";
import {
  AuthNoticeTone,
  AuthStatus,
  StoredSession,
} from "@/features/auth/session/session-types";
import {
  AuthContext,
  AuthContextValue,
} from "@/features/auth/session/auth-context-value";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/features/auth/session/session-storage";
import { useI18n } from "@/shared/i18n/use-i18n";
import {
  configureHttpClient,
  resetHttpClientConfig,
} from "@/shared/api/http-client";
import { User } from "@/shared/types/user";

function createStoredSession(session: AuthSession): StoredSession {
  return {
    user: session.user,
    tokens: session.tokens,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUser] = useState<User | null>(null);
  const [noticeKey, setNoticeKey] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<AuthNoticeTone>("info");
  const sessionRef = useRef<StoredSession | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const setGuestState = useCallback(
    (nextNoticeKey?: string, nextTone: AuthNoticeTone = "info") => {
      sessionRef.current = null;
      clearStoredSession();
      startTransition(() => {
        setUser(null);
        setStatus("guest");
        setNoticeKey(nextNoticeKey || null);
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
      setStatus("authenticated");
      setNoticeKey(null);
      setNoticeTone("info");
    });
  }, []);

  const syncAuthenticatedUser = useCallback(
    (nextUser: User) => {
      const activeSession = sessionRef.current;

      if (!activeSession) {
        return;
      }

      syncAuthenticatedSession({
        ...activeSession,
        user: nextUser,
      });
    },
    [syncAuthenticatedSession],
  );

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
        setGuestState("auth.notices.sessionExpired", "danger");
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
      onUnauthorized: () =>
        setGuestState("auth.notices.sessionExpired", "danger"),
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
          setStatus("guest");
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
            setGuestState("auth.notices.sessionExpired", "danger");
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
            setGuestState("auth.notices.sessionRestoreFailed", "danger");
          }
        }
      }
    }

    void boot();

    return () => {
      isMounted = false;
    };
  }, [refreshSession, setGuestState, syncAuthenticatedSession]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const session = await loginRequest(payload);
      syncAuthenticatedSession(createStoredSession(session));
    },
    [syncAuthenticatedSession],
  );

  const register = useCallback(
    async (payload: {
      avatarFile?: File;
      displayName: string;
      email: string;
      password: string;
    }) => {
      const { avatarFile, ...registerPayload } = payload;
      const session = await registerRequest(registerPayload);
      syncAuthenticatedSession(createStoredSession(session));

      if (avatarFile) {
        const result = await uploadCurrentUserAvatar(avatarFile);
        syncAuthenticatedUser(result.user);
      }
    },
    [syncAuthenticatedSession, syncAuthenticatedUser],
  );

  const updateProfile = useCallback(
    async (payload: { displayName: string }) => {
      const result = await updateCurrentUserProfile(payload);
      syncAuthenticatedUser(result.user);

      return result.user;
    },
    [syncAuthenticatedUser],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const result = await uploadCurrentUserAvatar(file);
      syncAuthenticatedUser(result.user);

      return result.user;
    },
    [syncAuthenticatedUser],
  );

  const deleteAvatar = useCallback(async () => {
    const result = await deleteCurrentUserAvatar();
    syncAuthenticatedUser(result.user);

    return result.user;
  }, [syncAuthenticatedUser]);

  const logout = useCallback(async () => {
    const activeSession = sessionRef.current;

    if (!activeSession?.tokens.refreshToken) {
      setGuestState("auth.notices.loggedOut", "success");
      return;
    }

    try {
      await logoutRequest({
        refreshToken: activeSession.tokens.refreshToken,
      });
      setGuestState("auth.notices.loggedOut", "success");
    } catch {
      setGuestState("auth.notices.loggedOutLocal", "success");
    }
  }, [setGuestState]);

  const clearNotice = useCallback(() => {
    setNoticeKey(null);
    setNoticeTone("info");
  }, []);

  const notice = noticeKey ? t(noticeKey) : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      notice,
      noticeTone,
      user,
      login,
      logout,
      register,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      clearNotice,
    }),
    [
      clearNotice,
      deleteAvatar,
      login,
      logout,
      notice,
      noticeTone,
      register,
      status,
      updateProfile,
      uploadAvatar,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
