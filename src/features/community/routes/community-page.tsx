import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { listPosts } from '@/features/community/api/posts-api';
import { CommunityPostList } from '@/features/community/components/community-post-list';
import { communityQueryKeys } from '@/features/community/lib/community-query-keys';
import { resolveCommunityPostListQuery } from '@/features/community/lib/post-query-params';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageSection } from '@/shared/ui/page-section';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';
import { SiteHeader } from '@/shared/ui/site-header';

export function CommunityPage() {
  const { t } = useI18n();
  const postsQuery = useQuery({
    queryKey: communityQueryKeys.listQuery(resolveCommunityPostListQuery()),
    queryFn: ({ signal }) => listPosts(undefined, { signal }),
    staleTime: 30_000,
  });

  if (postsQuery.isPending) {
    return <PublicPageSkeleton variant="community" />;
  }

  if (postsQuery.isError) {
    return (
      <CommunityShell>
        <EmptyState
          action={
            <button
              className={getButtonClasses()}
              onClick={() => void postsQuery.refetch()}
              type="button"
            >
              {t('trips.actions.retry')}
            </button>
          }
          description={
            postsQuery.error instanceof ApiError && postsQuery.error.message
              ? postsQuery.error.message
              : t('community.loadErrorDescription')
          }
          autoFocus
          eyebrow={t('community.eyebrow')}
          title={t('community.loadErrorTitle')}
        />
      </CommunityShell>
    );
  }

  if (!postsQuery.data) {
    return null;
  }

  const { data, meta } = postsQuery.data;

  if (data.length === 0) {
    return (
      <CommunityShell>
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Link className={getButtonClasses()} to="/app/community/new">
                {t('community.actions.startWriting')}
              </Link>
              <Link className={getButtonClasses('secondary')} to="/">
                {t('community.actions.backHome')}
              </Link>
            </div>
          }
          autoFocus
          description={t('community.emptyDescription')}
          eyebrow={t('community.eyebrow')}
          title={t('community.emptyTitle')}
        />
      </CommunityShell>
    );
  }

  return (
    <CommunityShell>
      <div className="space-y-5">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="eyebrow-text text-[var(--color-forest)]">
              {t('community.eyebrow')}
            </p>
            <h1 className="headline text-3xl text-[var(--color-ink)] sm:text-4xl">
              {t('community.title')}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('community.description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-ink-soft)]">
              {t('community.summary', { count: meta.totalElements })}
            </p>
            <Link className={getButtonClasses()} to="/app/community/new">
              {t('community.actions.startWriting')}
            </Link>
          </div>
        </Card>

        <CommunityPostList label={t('community.title')} posts={data} />
      </div>
    </CommunityShell>
  );
}

function CommunityShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <PageSection className="pt-12">{children}</PageSection>
      </main>
    </div>
  );
}
