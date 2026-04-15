import { PageSection } from '@/shared/ui/page-section';
import { Skeleton } from '@/shared/ui/skeleton';

type PublicPageSkeletonProps = {
  variant?: 'landing' | 'community' | 'post';
};

export function PublicPageSkeleton({ variant = 'landing' }: PublicPageSkeletonProps) {
  return (
    <div className="min-h-screen pb-12">
      <header className="page-shell pt-5 sm:pt-7">
        <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Skeleton className="h-10 w-28 rounded-full" />
          <div className="hidden gap-3 md:flex">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <Skeleton className="h-11 w-11 rounded-full md:hidden" />
        </div>
      </header>

      <PageSection className="pt-12">
        {variant === 'landing' ? <LandingSkeletonBody /> : null}
        {variant === 'community' ? <CommunitySkeletonBody /> : null}
        {variant === 'post' ? <PostSkeletonBody /> : null}
      </PageSection>
    </div>
  );
}

function LandingSkeletonBody() {
  return (
    <div className="space-y-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-16 w-full max-w-3xl rounded-[2rem]" />
          <Skeleton className="h-16 w-[92%] max-w-3xl rounded-[2rem]" />
          <Skeleton className="h-7 w-full max-w-2xl rounded-full" />
          <Skeleton className="h-7 w-[88%] max-w-2xl rounded-full" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-48 rounded-full" />
          </div>
        </div>

        <div className="glass-panel rounded-[var(--radius-xl)] p-6">
          <Skeleton className="h-56 w-full rounded-[1.75rem]" />
          <div className="grid gap-4 pt-6 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-[1.5rem]" />
            <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
      </div>
    </div>
  );
}

function CommunitySkeletonBody() {
  return (
    <div className="space-y-10">
      <div className="glass-panel rounded-[var(--radius-xl)] p-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-14 w-full max-w-2xl rounded-[2rem]" />
          <Skeleton className="h-7 w-full max-w-3xl rounded-full" />
          <Skeleton className="h-7 w-[86%] max-w-3xl rounded-full" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-[24rem] w-full rounded-[var(--radius-xl)]" />
        <Skeleton className="h-[24rem] w-full rounded-[var(--radius-xl)]" />
      </div>
    </div>
  );
}

function PostSkeletonBody() {
  return (
    <div className="glass-panel rounded-[var(--radius-xl)] p-8">
      <div className="space-y-5">
        <Skeleton className="h-10 w-44 rounded-full" />
        <Skeleton className="h-4 w-48 rounded-full" />
        <Skeleton className="h-14 w-full max-w-2xl rounded-[2rem]" />
        <Skeleton className="h-7 w-full max-w-3xl rounded-full" />
        <Skeleton className="h-7 w-[92%] max-w-3xl rounded-full" />
        <Skeleton className="h-7 w-[80%] max-w-2xl rounded-full" />
      </div>
    </div>
  );
}
