import { StatusBanner } from '@/shared/ui/status-banner';

type AuthStatusBannerProps = {
  message?: string | null;
  tone?: 'danger' | 'info' | 'success';
};

export function AuthStatusBanner({ message, tone = 'info' }: AuthStatusBannerProps) {
  if (!message) {
    return null;
  }

  return <StatusBanner tone={tone}>{message}</StatusBanner>;
}
