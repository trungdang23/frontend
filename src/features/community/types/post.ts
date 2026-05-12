export type PostVisibility = 'public';

export type CommunityPostAuthor = {
  id: string;
  displayName: string | null;
  avatarUrl?: string | null;
};

export type CommunityPostTrip = {
  id: string;
  name: string;
  coverImageUrl: string | null;
} | null;

export type CommunityPost = {
  id: string;
  userId: string;
  tripId: string | null;
  title: string;
  content: string;
  coverImageUrl: string | null;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
  author: CommunityPostAuthor;
  trip: CommunityPostTrip;
};

export type CommunityPostSort = 'createdAt,asc' | 'createdAt,desc';

export type CommunityPostListMeta = {
  page: number;
  size: number;
  sort: CommunityPostSort;
  totalElements: number;
  totalPages: number;
};

export type CommunityPostListQuery = {
  page: number;
  size: number;
  sort: CommunityPostSort;
};

export type CommunityPostListResult = {
  data: CommunityPost[];
  meta: CommunityPostListMeta;
};

export type CommunityPostCreatePayload = {
  title: string;
  content: string;
  coverImageUrl: string | null;
  tripId?: string;
};
