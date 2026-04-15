import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-forest)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-forest-deep)]',
  secondary:
    'border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] text-[var(--color-ink)] hover:border-[var(--color-forest)]',
  ghost: 'text-[var(--color-forest)] hover:bg-white/60',
};

export function getButtonClasses(variant: ButtonVariant = 'primary') {
  return cn(
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-forest)] disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
  );
}
