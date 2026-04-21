import type { CommunityPost } from '@/features/community/types/post';
import { CommunityPostCard } from '@/features/community/components/community-post-card';

type CommunityPostListProps = {
  label: string;
  posts: CommunityPost[];
};

export function CommunityPostList({ label, posts }: CommunityPostListProps) {
  return (
    <ul aria-label={label} className="grid gap-5 lg:grid-cols-2">
      {posts.map((post) => (
        <li className="list-none" key={post.id}>
          <CommunityPostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
