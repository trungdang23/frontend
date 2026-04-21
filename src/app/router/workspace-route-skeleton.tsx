import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export function WorkspaceRouteSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl rounded-[2rem]" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-full" />
        <Skeleton className="h-5 w-[82%] max-w-2xl rounded-full" />
      </Card>

      <Card className="space-y-4">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-10 w-72 max-w-full rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
        </div>
      </Card>
    </div>
  );
}
