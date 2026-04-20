import type { CommunityPostListQuery } from '@/features/community/types/post';

export const communityQueryKeys = {
  all: ['community'] as const,
  posts: ['community', 'posts'] as const,
  list: ['community', 'posts', 'list'] as const,
  listQuery: (query: CommunityPostListQuery) =>
    ['community', 'posts', 'list', query] as const,
  detail: (postId: string) => ['community', 'posts', 'detail', postId] as const,
};
