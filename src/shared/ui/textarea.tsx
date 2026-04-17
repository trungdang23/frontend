import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[1.5rem] border bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-[var(--color-ink-soft)] focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]',
        hasError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-strong)]',
        className,
      )}
      {...props}
    />
  );
});
