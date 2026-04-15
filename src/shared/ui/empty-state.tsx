import { ReactNode } from 'react';
import { Card } from '@/shared/ui/card';

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, eyebrow, title }: EmptyStateProps) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        <p className="eyebrow-text text-[var(--color-forest)]">{eyebrow}</p>
        <div className="space-y-2">
          <h2 className="headline text-3xl text-[var(--color-ink)]">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {description}
          </p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </Card>
  );
}
