import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

type StatusBannerProps = {
  autoFocus?: boolean;
  children: ReactNode;
  tone?: 'danger' | 'info' | 'success';
};

const toneClasses = {
  danger: 'border-[rgba(184,71,71,0.24)] bg-[rgba(184,71,71,0.08)] text-[var(--color-danger)]',
  info: 'border-[var(--color-border-strong)] bg-white/70 text-[var(--color-forest)]',
  success:
    'border-[rgba(63,127,83,0.22)] bg-[rgba(63,127,83,0.08)] text-[var(--color-success)]',
};

const toneIcons = {
  danger: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

export function StatusBanner({
  autoFocus = false,
  children,
  tone = 'info',
}: StatusBannerProps) {
  const Icon = toneIcons[tone];
  const role = tone === 'danger' ? 'alert' : 'status';
  const ariaLive = tone === 'danger' ? 'assertive' : 'polite';
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      bannerRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoFocus, children, tone]);

  return (
    <div
      ref={bannerRef}
      className={cn(
        'flex items-start gap-3 rounded-3xl border px-4 py-3 text-sm leading-6 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-forest)]',
        toneClasses[tone],
      )}
      aria-live={ariaLive}
      role={role}
      tabIndex={autoFocus ? -1 : undefined}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
