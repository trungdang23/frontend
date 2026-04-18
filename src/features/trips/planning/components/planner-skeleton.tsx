import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export function PlannerSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card className="space-y-4" key={index}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
    </div>
  );
}
