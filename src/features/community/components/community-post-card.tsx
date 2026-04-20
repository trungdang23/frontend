import { Link } from 'react-router-dom';

import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import {
  formatCommunityPostDate,
  getCommunityPostAuthorName,
  getCommunityPostExcerpt,
  resolveCommunityPostCoverImage,
} from '@/features/community/lib/community-post-presenters';
import type { CommunityPost } from '@/features/community/types/post';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { getButtonClasses } from '@/shared/ui/button-styles';

type CommunityPostCardProps = {
  post: CommunityPost;
};

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const { language, t } = useI18n();
  const authorName = getCommunityPostAuthorName(post, t);
  const publishedAt = formatCommunityPostDate(post.createdAt, language);

  return (
    <Card className="group overflow-hidden p-0 motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_28px_80px_rgba(12,24,18,0.18)]">
      <Link aria-label={post.title} className="block" to={`/community/${post.id}`}>
        <div className="relative h-64">
          <TripCoverImage
            alt={post.title}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
            src={resolveCommunityPostCoverImage(post)}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.18),rgba(12,24,18,0.82))]" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/72">
              {t('community.cardEyebrow')}
            </p>
            <h2 className="text-3xl font-semibold leading-tight">{post.title}</h2>
            <p className="text-sm text-white/78">
              {authorName} • {publishedAt}
            </p>
          </div>
        </div>
      </Link>

      <div className="space-y-5 p-6">
        <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
          {getCommunityPostExcerpt(post.content)}
        </p>

        {post.trip ? (
          <div className="space-y-3 rounded-[1.5rem] bg-white/70 px-4 py-4">
            <p className="eyebrow-text-xs text-[var(--color-forest)]">
              {t('community.linkedTripEyebrow')}
            </p>
            <p className="text-base font-semibold text-[var(--color-ink)]">
              {post.trip.name}
            </p>
            <Link
              className={getButtonClasses('secondary')}
              to={`/trips/${post.trip.id}`}
            >
              {t('community.actions.viewLinkedTrip')}
            </Link>
          </div>
        ) : null}

        <Link className={getButtonClasses()} to={`/community/${post.id}`}>
          {t('common.actions.viewStory')}
        </Link>
      </div>
    </Card>
  );
}
