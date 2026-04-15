import { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[1.5rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.4),rgba(255,255,255,0.85),rgba(255,255,255,0.4))] bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  );
}
