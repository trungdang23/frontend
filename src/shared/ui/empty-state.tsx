import { ReactNode, useEffect, useRef } from 'react';
import { Card } from '@/shared/ui/card';

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  autoFocus?: boolean;
};

export function EmptyState({
  action,
  autoFocus = false,
  description,
  eyebrow,
  title,
}: EmptyStateProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      titleRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoFocus, description, title]);

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        <p className="eyebrow-text text-[var(--color-forest)]">{eyebrow}</p>
        <div className="space-y-2">
          <h2
            className="headline text-3xl text-[var(--color-ink)] outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-forest)]"
            ref={titleRef}
            tabIndex={autoFocus ? -1 : undefined}
          >
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {description}
          </p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </Card>
  );
}
