import type { CommunityPost } from '@/features/community/types/post';

type Translate = (key: string) => string;

export function formatCommunityPostDate(
  createdAt: string,
  language: string,
) {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'long',
  }).format(new Date(createdAt));
}

export function getCommunityPostExcerpt(
  content: string,
  maxLength = 220,
) {
  const normalizedContent = content.trim().replace(/\s+/g, ' ');

  if (normalizedContent.length <= maxLength) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, maxLength).trimEnd()}...`;
}

export function getCommunityPostAuthorName(
  post: CommunityPost,
  t: Translate,
) {
  return post.author.displayName?.trim() || t('common.userFallback');
}

export function resolveCommunityPostCoverImage(
  post: CommunityPost,
) {
  return post.coverImageUrl ?? post.trip?.coverImageUrl ?? null;
}
