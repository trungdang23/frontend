import { useQuery } from '@tanstack/react-query';
import { Mail, UserRound } from 'lucide-react';
import { getCurrentUser } from '@/features/auth/api/auth-api';
import { useAuth } from '@/features/auth/session/use-auth';
import { ApiError } from '@/shared/api/api-error';
import { Card } from '@/shared/ui/card';
import { StatusBanner } from '@/shared/ui/status-banner';

export function ProfilePage() {
  const auth = useAuth();
  const profileQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: auth.status === 'authenticated',
    initialData: auth.user ? { user: auth.user } : undefined,
  });

  const profile = profileQuery.data?.user || auth.user;

  return (
    <div className="space-y-8">
      <Card className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-forest)]">
          Ho so
        </p>
        <div className="space-y-3">
          <h1 className="headline text-4xl text-[var(--color-ink)]">Thông tin tài khoản hiện tại</h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Trang này đang dùng contract `GET /auth/me` thật để làm baseline cho profile summary của
            phase đầu.
          </p>
        </div>
      </Card>

      {profileQuery.isError ? (
        <StatusBanner tone="danger">
          {profileQuery.error instanceof ApiError
            ? profileQuery.error.message
            : 'Không thể tải thông tin hồ sơ lúc này.'}
        </StatusBanner>
      ) : null}

      {profile ? (
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="space-y-5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(84,107,65,0.1)] text-[var(--color-forest)]">
              <UserRound className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="headline text-3xl text-[var(--color-ink)]">{profile.displayName}</h2>
              <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                Tài khoản đang ở baseline phase đầu, sẵn sàng đồng bộ với dashboard và protected
                shell.
              </p>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-forest)]">Display name</p>
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{profile.displayName}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[var(--color-forest)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-forest)]">Email</p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-forest)]">Created at</p>
              <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                {new Date(profile.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
