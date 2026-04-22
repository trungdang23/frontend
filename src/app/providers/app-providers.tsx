import { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/session/auth-context';
import { LanguageProvider } from '@/shared/i18n/language-provider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      });

      client.setQueryDefaults(['trips', 'list'], {
        staleTime: 30_000,
      });
      client.setQueryDefaults(['trips', 'detail'], {
        staleTime: 30_000,
      });
      client.setQueryDefaults(['trips', 'planner'], {
        staleTime: 0,
      });
      client.setQueryDefaults(['community', 'posts', 'list'], {
        staleTime: 30_000,
      });
      client.setQueryDefaults(['community', 'posts', 'mine'], {
        staleTime: 30_000,
      });
      client.setQueryDefaults(['community', 'posts', 'detail'], {
        staleTime: 30_000,
      });
      client.setQueryDefaults(['auth', 'me'], {
        staleTime: 300_000,
      });

      return client;
    },
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
