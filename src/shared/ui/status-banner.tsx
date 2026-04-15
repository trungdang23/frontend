import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type StatusBannerProps = {
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

export function StatusBanner({ children, tone = 'info' }: StatusBannerProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-3xl border px-4 py-3 text-sm leading-6',
        toneClasses[tone],
      )}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
