import { StatusBanner } from '@/shared/ui/status-banner';

type AuthStatusBannerProps = {
  autoFocus?: boolean;
  message?: string | null;
  tone?: 'danger' | 'info' | 'success';
};

export function AuthStatusBanner({
  autoFocus = false,
  message,
  tone = 'info',
}: AuthStatusBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <StatusBanner autoFocus={autoFocus} tone={tone}>
      {message}
    </StatusBanner>
  );
}
