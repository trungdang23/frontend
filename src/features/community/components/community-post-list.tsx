import type { CommunityPost } from '@/features/community/types/post';
import { CommunityPostCard } from '@/features/community/components/community-post-card';

type CommunityPostListProps = {
  posts: CommunityPost[];
};

export function CommunityPostList({ posts }: CommunityPostListProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {posts.map((post) => (
        <CommunityPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
