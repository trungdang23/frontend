import { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/cn';

type PageSectionProps = PropsWithChildren<{
  className?: string;
}>;

export function PageSection({ children, className }: PageSectionProps) {
  return <section className={cn('page-shell py-10 sm:py-12', className)}>{children}</section>;
}
