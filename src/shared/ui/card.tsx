import { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('glass-panel rounded-[var(--radius-xl)] p-6 sm:p-8', className)}
      {...props}
    />
  );
}
