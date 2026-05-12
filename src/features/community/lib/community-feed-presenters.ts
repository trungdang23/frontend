import type { CommunityPost } from '@/features/community/types/post';
import type { TripJournalResult } from '@/features/journal/types/journal';
import type { Trip, TripAuthor } from '@/features/trips/types/trip';
import { resolveUserAvatarUrl } from '@/features/auth/api/auth-api';

export type CommunityRegion = 'All' | 'North' | 'Central' | 'South';
export type CommunityFeedCardSource = 'journal' | 'planner' | 'post';

export type CommunityFeedCard = {
  authorName: string | null;
  avatarUrl: string;
  coverImageUrl: string | null;
  decorativeCommentCount: number;
  decorativeLikeCount: number;
  displayTitle: string;
  excerpt: string;
  href: string | null;
  id: string;
  region: Exclude<CommunityRegion, 'All'>;
  rotate: number;
  sortAt: string;
  source: CommunityFeedCardSource;
  tapeClassName: string;
};

const REGION_KEYWORDS: Record<Exclude<CommunityRegion, 'All'>, string[]> = {
  North: [
    'hà nội',
    'ha noi',
    'ninh bình',
    'ninh binh',
    'hạ long',
    'ha long',
    'sapa',
    'sa pa',
    'hải phòng',
    'hai phong',
    'cao bằng',
    'cao bang',
  ],
  Central: [
    'huế',
    'hue',
    'hội an',
    'hoi an',
    'đà nẵng',
    'da nang',
    'đà lạt',
    'da lat',
    'nha trang',
    'quy nhơn',
    'quy nhon',
    'phú yên',
    'phu yen',
  ],
  South: [
    'hồ chí minh',
    'ho chi minh',
    'sài gòn',
    'sai gon',
    'phú quốc',
    'phu quoc',
    'cần thơ',
    'can tho',
    'mekong',
    'miền tây',
    'mien tay',
    'vũng tàu',
    'vung tau',
  ],
};

const ROTATIONS = [-2.4, 1.3, -1.2, 2.1, -1.7, 1.6, -2.1, 1.9] as const;
const TAPE_CLASSES = [
  'bg-[rgba(153,205,232,0.72)]',
  'bg-[rgba(242,204,111,0.76)]',
  'bg-[rgba(242,160,136,0.76)]',
  'bg-[rgba(167,215,173,0.78)]',
] as const;

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizePostText(post: CommunityPost) {
  return [
    post.title,
    post.content,
    post.trip?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi-VN');
}

export function deriveCommunityRegion(post: CommunityPost): Exclude<CommunityRegion, 'All'> {
  return deriveCommunityRegionFromText(normalizePostText(post), post.id);
}

function deriveCommunityRegionFromText(
  normalized: string,
  seed: string,
): Exclude<CommunityRegion, 'All'> {
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS) as Array<[Exclude<CommunityRegion, 'All'>, string[]]>) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return region;
    }
  }

  const fallbackIndex = hashString(seed) % 3;

  if (fallbackIndex === 0) {
    return 'North';
  }

  if (fallbackIndex === 1) {
    return 'Central';
  }

  return 'South';
}

function createExcerpt(content: string) {
  const collapsed = content.replace(/\s+/g, ' ').trim();

  if (collapsed.length <= 110) {
    return collapsed;
  }

  return `${collapsed.slice(0, 107).trimEnd()}...`;
}

function getCommunityCardTitle(post: CommunityPost) {
  const postTitle = post.title.trim();

  if (postTitle) {
    return postTitle;
  }

  return post.trip?.name?.trim() || post.id;
}

function createAvatarFallbackUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function resolveAuthorName(
  author: { displayName: string | null } | null | undefined,
  fallback: string,
) {
  return author?.displayName?.trim() || fallback;
}

function resolveAuthorAvatarUrl(
  author: { avatarUrl?: string | null } | null | undefined,
  seed: string,
) {
  return resolveUserAvatarUrl(author?.avatarUrl) || createAvatarFallbackUrl(seed);
}

export function decorateCommunityPosts(posts: CommunityPost[]): CommunityFeedCard[] {
  return posts.map((post) => {
    const hash = hashString(post.id);
    const displayName = resolveAuthorName(post.author, post.userId || post.id);

    return {
      authorName: displayName,
      avatarUrl: resolveAuthorAvatarUrl(post.author, displayName),
      coverImageUrl: post.coverImageUrl || post.trip?.coverImageUrl || null,
      decorativeCommentCount: (hash % 18) + 6,
      decorativeLikeCount: (hash % 260) + 48,
      displayTitle: getCommunityCardTitle(post),
      excerpt: createExcerpt(post.content),
      href: post.trip ? `/public/trips/${encodeURIComponent(post.trip.id)}` : null,
      id: `post-${post.id}`,
      region: deriveCommunityRegion(post),
      rotate: ROTATIONS[hash % ROTATIONS.length],
      sortAt: post.createdAt,
      source: 'post',
      tapeClassName: TAPE_CLASSES[hash % TAPE_CLASSES.length],
    };
  });
}

export function decoratePublicTrips(trips: Trip[]): CommunityFeedCard[] {
  return trips.map((trip) =>
    createTripFeedCard({
      coverImageUrl: trip.coverImageUrl,
      displayTitle: trip.name,
      excerpt: trip.summaryNotes || trip.destination || formatTripDates(trip),
      href: `/public/trips/${encodeURIComponent(trip.id)}`,
      id: `planner-${trip.id}`,
      seed: trip.id,
      source: 'planner',
      sortAt: trip.updatedAt,
      trip,
    }),
  );
}

export function decoratePublicJournals(
  results: TripJournalResult[],
): CommunityFeedCard[] {
  return results.map(({ journal, trip }) => {
    const journalText = getJournalText(journal.objects);

    return createTripFeedCard({
      coverImageUrl: resolveJournalCoverImage(journal.objects) || trip.coverImageUrl,
      displayTitle: trip.name,
      excerpt:
        journalText ||
        trip.destination ||
        `${journal.objects.length} mảnh nhật ký`,
      href: `/public/trips/${encodeURIComponent(trip.id)}/journal`,
      id: `journal-${journal.id ?? trip.id}`,
      seed: journal.id ?? trip.id,
      source: 'journal',
      sortAt: journal.updatedAt,
      trip,
      extraSearchText: journalText,
    });
  });
}

export function mergeCommunityFeedCards(
  cards: CommunityFeedCard[],
): CommunityFeedCard[] {
  return [...cards].sort(
    (left, right) =>
      right.sortAt.localeCompare(left.sortAt) || left.id.localeCompare(right.id),
  );
}

function createTripFeedCard({
  coverImageUrl,
  displayTitle,
  excerpt,
  extraSearchText = '',
  href,
  id,
  seed,
  sortAt,
  source,
  trip,
}: {
  coverImageUrl: string | null;
  displayTitle: string;
  excerpt: string;
  extraSearchText?: string;
  href: string;
  id: string;
  seed: string;
  sortAt: string;
  source: Exclude<CommunityFeedCardSource, 'post'>;
  trip: Trip;
}): CommunityFeedCard {
  const hash = hashString(seed);
  const author = resolveTripAuthor(trip);
  const authorName = resolveAuthorName(author, trip.userId || trip.id);
  const normalized = [
    trip.name,
    trip.destination,
    trip.summaryNotes,
    extraSearchText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi-VN');

  return {
    authorName,
    avatarUrl: resolveAuthorAvatarUrl(author, authorName),
    coverImageUrl,
    decorativeCommentCount: (hash % 18) + 6,
    decorativeLikeCount: (hash % 260) + 48,
    displayTitle,
    excerpt: createExcerpt(excerpt),
    href,
    id,
    region: deriveCommunityRegionFromText(normalized, seed),
    rotate: ROTATIONS[hash % ROTATIONS.length],
    sortAt,
    source,
    tapeClassName: TAPE_CLASSES[hash % TAPE_CLASSES.length],
  };
}

function resolveTripAuthor(trip: Trip): TripAuthor | null {
  return trip.author ?? null;
}

function getJournalText(objects: TripJournalResult['journal']['objects']) {
  return objects
    .map((object) => object.props.text)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
}

function resolveJournalCoverImage(objects: TripJournalResult['journal']['objects']) {
  const photo = objects.find((object) => object.type === 'photo');
  const imageUrl = photo?.props.imageUrl;

  return typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
}

function formatTripDates(trip: Trip) {
  return `${trip.startDate} - ${trip.endDate}`;
}
