import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, 'aria-invalid': ariaInvalidProp, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={hasError ? true : ariaInvalidProp}
      className={cn(
        'w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-[var(--color-ink-soft)] focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]',
        hasError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-strong)]',
        className,
      )}
      {...props}
    />
  );
});
