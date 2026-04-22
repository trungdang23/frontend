import type { CommunityPost } from '@/features/community/types/post';

export type CommunityRegion = 'All' | 'North' | 'Central' | 'South';

export type CommunityFeedCard = {
  avatarUrl: string;
  coverImageUrl: string | null;
  decorativeCommentCount: number;
  decorativeLikeCount: number;
  excerpt: string;
  post: CommunityPost;
  region: Exclude<CommunityRegion, 'All'>;
  rotate: number;
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

function normalizeText(post: CommunityPost) {
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
  const normalized = normalizeText(post);

  for (const [region, keywords] of Object.entries(REGION_KEYWORDS) as Array<[Exclude<CommunityRegion, 'All'>, string[]]>) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return region;
    }
  }

  const fallbackIndex = hashString(post.id) % 3;

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

export function decorateCommunityPosts(posts: CommunityPost[]): CommunityFeedCard[] {
  return posts.map((post) => {
    const hash = hashString(post.id);
    const displayName = post.author.displayName || post.userId || post.id;

    return {
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
      coverImageUrl: post.coverImageUrl || post.trip?.coverImageUrl || null,
      decorativeCommentCount: (hash % 18) + 6,
      decorativeLikeCount: (hash % 260) + 48,
      excerpt: createExcerpt(post.content),
      post,
      region: deriveCommunityRegion(post),
      rotate: ROTATIONS[hash % ROTATIONS.length],
      tapeClassName: TAPE_CLASSES[hash % TAPE_CLASSES.length],
    };
  });
}
