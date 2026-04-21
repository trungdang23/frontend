import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, hasError = false, 'aria-invalid': ariaInvalidProp, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const { t } = useI18n();

    return (
      <div
        className={cn(
          'flex items-center rounded-2xl border bg-white/80 shadow-sm transition focus-within:border-[var(--color-forest)] focus-within:ring-4 focus-within:ring-[rgba(84,107,65,0.12)]',
          hasError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-strong)]',
          className,
        )}
      >
        <input
          aria-invalid={hasError ? true : ariaInvalidProp}
          ref={ref}
          className="w-full rounded-2xl border-none bg-transparent px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-soft)]"
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-pressed={visible}
          className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition hover:bg-[rgba(84,107,65,0.08)] hover:text-[var(--color-forest)]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">
            {visible ? t('common.actions.hidePassword') : t('common.actions.showPassword')}
          </span>
        </button>
      </div>
    );
  },
);
