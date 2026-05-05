import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  buildProfileJournalEntries,
  buildProfilePostEntries,
  buildProfileTripEntries,
  formatProfileDate,
  formatTripDuration,
} from '@/features/profile/lib/profile-presenters';

describe('profile presenters', () => {
  it('formats dates in the profile scrapbook style', () => {
    expect(formatProfileDate('2026-04-22T10:30:00.000Z')).toBe('22 Tháng 4, 2026');
  });

  it('formats trip durations inclusively', () => {
    expect(formatTripDuration('2026-04-22', '2026-04-25')).toBe('4 ngày');
    expect(formatTripDuration('2026-04-22', '2026-04-28')).toBe('1 tuần');
  });

  it('builds scrapbook entries for posts, journals and trips', () => {
    const postEntries = buildProfilePostEntries(
      [
        {
          author: {
            displayName: 'Owner',
            id: 'user-1',
          },
          content: 'content',
          coverImageUrl: null,
          createdAt: '2026-04-22T10:30:00.000Z',
          id: 'post-1',
          title: 'Nhật ký Hội An',
          trip: {
            coverImageUrl: 'https://example.com/trip-cover.jpg',
            id: 'trip-1',
            name: 'Hoi An',
          },
          tripId: 'trip-1',
          updatedAt: '2026-04-22T10:30:00.000Z',
          userId: 'user-1',
          visibility: 'public',
        },
      ],
      'Đã đăng',
    );
    const tripEntries = buildProfileTripEntries(
      [
        {
          budgetAmount: 0,
          budgetCurrency: 'VND',
          budgetMode: 'auto',
          coverImageUrl: null,
          createdAt: '2026-04-22T10:30:00.000Z',
          destination: null,
          endDate: '2026-04-25',
          id: 'trip-1',
          manualBudgetAmount: null,
          manualBudgetCurrency: null,
          name: 'Đà Lạt',
          startDate: '2026-04-22',
          summaryNotes: null,
          timezone: null,
          updatedAt: '2026-04-22T10:30:00.000Z',
          userId: 'user-1',
          visibility: 'public',
        },
      ],
      'CHỈNH SỬA',
      'NHẬT KÝ',
      {
        public: 'Công khai',
      },
    );

    expect(postEntries[0]).toMatchObject({
      image: 'https://example.com/trip-cover.jpg',
      metadata: '22 Tháng 4, 2026 • Đã đăng',
      title: 'Nhật ký Hội An',
    });
    expect(tripEntries[0]).toMatchObject({
      actionHref: '/app/trips/trip-1/planner',
      actionLabel: 'CHỈNH SỬA',
      id: 'trip-1',
      metadata: '22 Tháng 4, 2026 • 4 ngày',
      secondaryActionHref: '/app/trips/trip-1/journal',
      secondaryActionLabel: 'NHẬT KÝ',
      shareBadgeLabel: 'Công khai',
      title: 'Đà Lạt',
    });

    const journalEntries = buildProfileJournalEntries(
      [
        {
          trip: {
            budgetAmount: 0,
            budgetCurrency: 'VND',
            budgetMode: 'auto',
            coverImageUrl: null,
            createdAt: '2026-04-22T10:30:00.000Z',
            destination: 'Đà Lạt',
            endDate: '2026-04-25',
            id: 'trip-1',
            manualBudgetAmount: null,
            manualBudgetCurrency: null,
            name: 'Đà Lạt',
            startDate: '2026-04-22',
            summaryNotes: null,
            timezone: null,
            updatedAt: '2026-04-22T10:30:00.000Z',
            userId: 'user-1',
            visibility: 'public',
          },
          journal: {
            createdAt: '2026-04-22T10:30:00.000Z',
            id: 'journal-1',
            objects: [
              {
                height: 300,
                id: 'photo-1',
                locked: false,
                props: {
                  imageUrl: 'https://example.com/journal.jpg',
                },
                rotation: 0,
                type: 'photo',
                width: 300,
                x: 0,
                y: 0,
                zIndex: 1,
              },
            ],
            page: {
              background: {
                style: 'paper-cream',
              },
              height: 1600,
              width: 1200,
            },
            sceneVersion: 1,
            tripId: 'trip-1',
            updatedAt: '2026-04-26T10:30:00.000Z',
            visibility: 'public',
          },
        },
      ],
      'CẬP NHẬT',
      {
        public: 'Công khai',
      },
    );

    expect(journalEntries[0]).toMatchObject({
      actionHref: '/app/trips/trip-1/journal',
      actionLabel: 'CẬP NHẬT',
      image: 'https://example.com/journal.jpg',
      metadata: '26 Tháng 4, 2026 • 1 mảnh',
      shareBadgeLabel: 'Công khai',
      title: 'Đà Lạt',
    });
  });
});
