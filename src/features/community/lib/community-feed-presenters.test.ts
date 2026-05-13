import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  decorateCommunityPosts,
  decoratePublicTrips,
} from '@/features/community/lib/community-feed-presenters';
import type { CommunityPost } from '@/features/community/types/post';
import type { Trip } from '@/features/trips/types/trip';

describe('community feed presenters', () => {
  it('uses the post title on community cards even when a trip name exists', () => {
    const cards = decorateCommunityPosts([
      {
        author: {
          avatarUrl: '/user-avatars/avatar-1',
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
    expect(cards[0]?.authorName).toBe('Trung');
    expect(cards[0]?.avatarUrl).toContain('/user-avatars/avatar-1');
  });

  it('shows public trip author metadata on discovery cards', () => {
    const cards = decoratePublicTrips([
      {
        author: {
          avatarUrl: '/user-avatars/trip-owner',
          displayName: 'Chủ chuyến đi',
          id: 'user-2',
        },
        budgetAmount: 0,
        budgetCurrency: 'VND',
        budgetMode: 'auto',
        coverImageUrl: null,
        createdAt: '2026-04-22T12:00:00.000Z',
        destination: 'Đà Nẵng',
        endDate: '2026-04-24',
        id: 'trip-1',
        manualBudgetAmount: null,
        manualBudgetCurrency: null,
        name: 'Đà Nẵng cuối tuần',
        startDate: '2026-04-22',
        summaryNotes: null,
        timezone: null,
        updatedAt: '2026-04-22T12:00:00.000Z',
        userId: 'user-2',
        visibility: 'public',
      } satisfies Trip,
    ]);

    expect(cards[0]?.authorName).toBe('Chủ chuyến đi');
    expect(cards[0]?.avatarUrl).toContain('/user-avatars/trip-owner');
  });

  it('uses legacy author name fields before hiding the label', () => {
    const cards = decorateCommunityPosts([
      {
        author: {
          avatarUrl: null,
          displayName: null,
          id: 'user-legacy',
          name: 'Tên cũ vẫn cần hiện',
        } as CommunityPost['author'] & { name: string },
        content: 'Bài viết cũ',
        coverImageUrl: null,
        createdAt: '2026-04-22T12:00:00.000Z',
        id: 'post-legacy',
        title: 'Post legacy',
        trip: null,
        tripId: null,
        updatedAt: '2026-04-22T12:00:00.000Z',
        userId: 'user-legacy',
        visibility: 'public',
      } satisfies CommunityPost,
    ]);

    expect(cards[0]?.authorName).toBe('Tên cũ vẫn cần hiện');
  });

  it('does not fall back to raw user ids when the post author has no display name', () => {
    const cards = decorateCommunityPosts([
      {
        author: {
          avatarUrl: null,
          displayName: null,
          id: 'user-no-name',
        },
        content: 'Bài viết chưa có display name',
        coverImageUrl: null,
        createdAt: '2026-04-22T12:00:00.000Z',
        id: 'post-no-name',
        title: 'Post không tên tác giả',
        trip: null,
        tripId: null,
        updatedAt: '2026-04-22T12:00:00.000Z',
        userId: 'user-no-name',
        visibility: 'public',
      } satisfies CommunityPost,
    ]);

    expect(cards[0]?.authorName).toBeNull();
    expect(cards[0]?.avatarUrl).toContain('seed=user-no-name');
  });
});
