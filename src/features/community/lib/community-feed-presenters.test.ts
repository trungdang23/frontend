import {
  describe,
  expect,
  it,
} from 'vitest';
import { decorateCommunityPosts } from '@/features/community/lib/community-feed-presenters';
import type { CommunityPost } from '@/features/community/types/post';

describe('community feed presenters', () => {
  it('uses the post title on community cards even when a trip name exists', () => {
    const cards = decorateCommunityPosts([
      {
        author: {
          displayName: 'Trung',
          id: 'user-1',
        },
        content: 'Nội dung bài viết',
        coverImageUrl: null,
        createdAt: '2026-04-22T12:00:00.000Z',
        id: 'post-1',
        title: 'Tên bài post cần hiển thị',
        trip: {
          coverImageUrl: null,
          id: 'trip-1',
          name: 'Tên chuyến đi không nên hiện',
        },
        tripId: 'trip-1',
        updatedAt: '2026-04-22T12:00:00.000Z',
        userId: 'user-1',
        visibility: 'public',
      } satisfies CommunityPost,
    ]);

    expect(cards[0]?.displayTitle).toBe('Tên bài post cần hiển thị');
  });
});
