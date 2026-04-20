import {
  CommunityPostListQuery,
} from '@/features/community/types/post';

export const DEFAULT_COMMUNITY_POST_LIST_QUERY: CommunityPostListQuery = {
  page: 0,
  size: 12,
  sort: 'createdAt,desc',
};

export function resolveCommunityPostListQuery(
  query?: Partial<CommunityPostListQuery>,
): CommunityPostListQuery {
  return {
    ...DEFAULT_COMMUNITY_POST_LIST_QUERY,
    ...query,
  };
}

export function buildCommunityPostListQueryString(
  query?: Partial<CommunityPostListQuery>,
) {
  const resolvedQuery = resolveCommunityPostListQuery(query);
  const searchParams = new URLSearchParams({
    page: String(resolvedQuery.page),
    size: String(resolvedQuery.size),
    sort: resolvedQuery.sort,
  });

  return searchParams.toString();
}
