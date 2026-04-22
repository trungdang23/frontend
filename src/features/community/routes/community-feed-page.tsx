import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun } from 'lucide-react';
import { listPosts } from '@/features/community/api/posts-api';
import { CommunityFeedCard } from '@/features/community/components/community-feed-card';
import { CommunityRegionFilter } from '@/features/community/components/community-region-filter';
import {
  decorateCommunityPosts,
} from '@/features/community/lib/community-feed-presenters';
import type { CommunityRegion } from '@/features/community/lib/community-feed-presenters';
import { communityQueryKeys } from '@/features/community/lib/community-query-keys';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { useI18n } from '@/shared/i18n/use-i18n';

const COMMUNITY_FEED_QUERY = {
  page: 0,
  size: 24,
  sort: 'createdAt,desc' as const,
};

const REGION_FILTERS = [
  {
    color: '#8fcae7',
    key: 'community.filters.north',
    region: 'North' as const,
    rotateClassName: '-rotate-2',
  },
  {
    color: '#f2cc6f',
    key: 'community.filters.central',
    region: 'Central' as const,
    rotateClassName: 'rotate-1',
  },
  {
    color: '#eb8a78',
    key: 'community.filters.south',
    region: 'South' as const,
    rotateClassName: 'rotate-2',
  },
] as const;

function CommunityFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="animate-pulse bg-white p-3 pb-8 shadow-[4px_4px_15px_rgba(0,0,0,0.12)]"
          key={index}
          style={{ transform: `rotate(${index % 2 === 0 ? -1.6 : 1.2}deg)` }}
        >
          <div className="mb-4 aspect-[4/5] bg-[rgba(239,231,216,0.95)]" />
          <div className="h-4 w-24 rounded-full bg-[rgba(242,160,136,0.35)]" />
          <div className="mt-3 h-7 w-3/4 rounded-full bg-[rgba(122,75,57,0.12)]" />
          <div className="mt-3 h-3 w-full rounded-full bg-[rgba(122,75,57,0.09)]" />
          <div className="mt-2 h-3 w-5/6 rounded-full bg-[rgba(122,75,57,0.09)]" />
        </div>
      ))}
    </div>
  );
}

export function CommunityFeedPage() {
  const { t } = useI18n();
  const [activeRegion, setActiveRegion] = useState<CommunityRegion>('All');
  const postsQuery = useQuery({
    queryFn: ({ signal }) => listPosts(COMMUNITY_FEED_QUERY, { signal }),
    queryKey: communityQueryKeys.listQuery(COMMUNITY_FEED_QUERY),
  });

  const decoratedPosts = useMemo(
    () => decorateCommunityPosts(postsQuery.data?.data || []),
    [postsQuery.data?.data],
  );

  const filteredPosts = useMemo(() => {
    if (activeRegion === 'All') {
      return decoratedPosts;
    }

    return decoratedPosts.filter((post) => post.region === activeRegion);
  }, [activeRegion, decoratedPosts]);

  return (
    <PublicPageShell
      mainClassName="relative mx-auto w-full max-w-[86rem] flex-1 px-4 pb-24 pt-2 sm:px-6 lg:px-10"
    >
      <div className="pointer-events-none fixed left-6 top-28 hidden opacity-35 lg:block">
        <svg className="translate-x-4 text-[var(--color-ink)]" fill="currentColor" height="40" viewBox="0 0 40 40" width="40">
          <path d="M5,15 Q15,5 25,15 T35,15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="-translate-x-2 translate-y-4 text-[var(--color-ink)]" fill="currentColor" height="40" viewBox="0 0 40 40" width="40">
          <path d="M5,15 Q15,5 25,15 T35,15" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="pointer-events-none fixed right-8 top-40 hidden opacity-35 lg:block">
        <Sun className="h-11 w-11 animate-pulse text-[var(--color-warm-brown)]" />
      </div>

      <section className="mb-14 flex justify-center pt-6 sm:mb-20">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {REGION_FILTERS.map((filter) => (
            <CommunityRegionFilter
              activeRegion={activeRegion}
              color={filter.color}
              key={filter.region}
              label={t(filter.key)}
              onToggle={(region) => {
                setActiveRegion((current) => (current === region ? 'All' : region));
              }}
              region={filter.region}
              rotateClassName={filter.rotateClassName}
            />
          ))}
        </div>
      </section>

      <section className="relative pb-8">
        <div className="pointer-events-none absolute left-[-1.5rem] top-[40%] hidden opacity-35 xl:block">
          <svg className="-rotate-[10deg] text-[var(--color-ink)]" fill="none" height="120" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 60 120" width="60">
            <path d="M10,10 C40,5 50,40 20,50 C-10,60 10,100 40,110" />
            <path d="M30,105 L40,110 L30,115" />
          </svg>
        </div>
        <div className="pointer-events-none absolute right-[-1.5rem] top-[40%] hidden opacity-35 xl:block">
          <svg className="rotate-[10deg] -scale-x-100 text-[var(--color-ink)]" fill="none" height="120" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 60 120" width="60">
            <path d="M10,10 C40,5 50,40 20,50 C-10,60 10,100 40,110" />
            <path d="M30,105 L40,110 L30,115" />
          </svg>
        </div>

        {postsQuery.isLoading ? (
          <CommunityFeedSkeleton />
        ) : null}

        {!postsQuery.isLoading && postsQuery.isError ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[rgba(122,75,57,0.16)] bg-[rgba(255,250,242,0.94)] px-6 py-8 text-center shadow-[0_22px_48px_rgba(96,72,50,0.12)]">
            <h2 className="font-title text-[1.9rem] text-[#1a1a1a]">
              {t('community.loadErrorTitle')}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('community.loadErrorDescription')}
            </p>
          </div>
        ) : null}

        {!postsQuery.isLoading && !postsQuery.isError && filteredPosts.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[rgba(122,75,57,0.16)] bg-[rgba(255,250,242,0.94)] px-6 py-8 text-center shadow-[0_22px_48px_rgba(96,72,50,0.12)]">
            <h2 className="font-title text-[1.9rem] text-[#1a1a1a]">
              {decoratedPosts.length === 0
                ? t('community.emptyTitle')
                : t('community.filteredEmptyTitle')}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
              {decoratedPosts.length === 0
                ? t('community.emptyDescription')
                : t('community.filteredEmptyDescription')}
            </p>
          </div>
        ) : null}

        {!postsQuery.isLoading && !postsQuery.isError && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPosts.map((post) => (
              <CommunityFeedCard card={post} key={post.post.id} />
            ))}
          </div>
        ) : null}
      </section>
    </PublicPageShell>
  );
}
