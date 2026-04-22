import { request, requestWithMeta } from '@/shared/api/http-client';
import {
  buildCommunityPostListQueryString,
  resolveCommunityPostListQuery,
} from '@/features/community/lib/post-query-params';
import type {
  CommunityPost,
  CommunityPostCreatePayload,
  CommunityPostListMeta,
  CommunityPostListQuery,
  CommunityPostListResult,
} from '@/features/community/types/post';

type RequestOptions = {
  signal?: AbortSignal;
};

export async function listPosts(
  query?: Partial<CommunityPostListQuery>,
  options: RequestOptions = {},
): Promise<CommunityPostListResult> {
  const resolvedQuery = resolveCommunityPostListQuery(query);
  const response = await requestWithMeta<CommunityPost[], CommunityPostListMeta>(
    `/posts?${buildCommunityPostListQueryString(resolvedQuery)}`,
    {
      signal: options.signal,
    },
  );

  return {
    data: response.data,
    meta: response.meta || {
      page: resolvedQuery.page,
      size: resolvedQuery.size,
      sort: resolvedQuery.sort,
      totalElements: response.data.length,
      totalPages: response.data.length > 0 ? 1 : 0,
    },
  };
}

export async function getPostDetail(
  postId: string,
  options: RequestOptions = {},
) {
  return request<CommunityPost>(`/posts/${postId}`, {
    signal: options.signal,
  });
}

export async function listMyPosts(
  query?: Partial<CommunityPostListQuery>,
  options: RequestOptions = {},
): Promise<CommunityPostListResult> {
  const resolvedQuery = resolveCommunityPostListQuery(query);
  const response = await requestWithMeta<CommunityPost[], CommunityPostListMeta>(
    `/posts/mine?${buildCommunityPostListQueryString(resolvedQuery)}`,
    {
      auth: true,
      signal: options.signal,
    },
  );

  return {
    data: response.data,
    meta: response.meta || {
      page: resolvedQuery.page,
      size: resolvedQuery.size,
      sort: resolvedQuery.sort,
      totalElements: response.data.length,
      totalPages: response.data.length > 0 ? 1 : 0,
    },
  };
}

export async function createPost(payload: CommunityPostCreatePayload) {
  return request<CommunityPost, CommunityPostCreatePayload>('/posts', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
