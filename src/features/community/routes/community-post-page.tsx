import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getPostDetail } from '@/features/community/api/posts-api';
import { CommunityPostDetail } from '@/features/community/components/community-post-detail';
import { communityQueryKeys } from '@/features/community/lib/community-query-keys';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageSection } from '@/shared/ui/page-section';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';
import { SiteHeader } from '@/shared/ui/site-header';

export function CommunityPostPage() {
  const { postId } = useParams();
  const { t } = useI18n();
  const postQuery = useQuery({
    queryKey: communityQueryKeys.detail(postId as string),
    queryFn: ({ signal }) => getPostDetail(postId as string, { signal }),
    enabled: Boolean(postId),
    staleTime: 30_000,
  });

  if (!postId || postQuery.isPending) {
    return <PublicPageSkeleton variant="post" />;
  }

  if (
    postQuery.isError &&
    postQuery.error instanceof ApiError &&
    postQuery.error.status === 404
  ) {
    return (
      <CommunityShell>
        <EmptyState
          action={
            <Link className={getButtonClasses()} to="/community">
              {t('common.actions.backToCommunity')}
            </Link>
          }
          description={t('community.notFoundDescription')}
          eyebrow={t('community.detailEyebrow')}
          title={t('community.notFoundTitle')}
        />
      </CommunityShell>
    );
  }

  if (postQuery.isError) {
    return (
      <CommunityShell>
        <EmptyState
          action={
            <button
              className={getButtonClasses()}
              onClick={() => void postQuery.refetch()}
              type="button"
            >
              {t('trips.actions.retry')}
            </button>
          }
          description={
            postQuery.error instanceof ApiError && postQuery.error.message
              ? postQuery.error.message
              : t('community.detailLoadErrorDescription')
          }
          eyebrow={t('community.detailEyebrow')}
          title={t('community.detailLoadErrorTitle')}
        />
      </CommunityShell>
    );
  }

  const post = postQuery.data;

  if (!post) {
    return null;
  }

  return (
    <CommunityShell>
      <CommunityPostDetail post={post} />
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
