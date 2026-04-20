import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import {
  formatCommunityPostDate,
  getCommunityPostAuthorName,
  resolveCommunityPostCoverImage,
} from '@/features/community/lib/community-post-presenters';
import type { CommunityPost } from '@/features/community/types/post';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { getButtonClasses } from '@/shared/ui/button-styles';

type CommunityPostDetailProps = {
  post: CommunityPost;
};

export function CommunityPostDetail({ post }: CommunityPostDetailProps) {
  const { language, t } = useI18n();
  const authorName = getCommunityPostAuthorName(post, t);
  const publishedAt = formatCommunityPostDate(post.createdAt, language);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-forest)]"
              to="/community"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.actions.backToCommunity')}
            </Link>

            <div className="space-y-3">
              <p className="eyebrow-text text-[var(--color-forest)]">
                {t('community.detailEyebrow')}
              </p>
              <h1 className="headline text-4xl text-[var(--color-ink)]">
                {post.title}
              </h1>
              <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                {authorName} • {publishedAt}
              </p>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/72 p-5">
              <p className="eyebrow-text-xs text-[var(--color-forest)]">
                {t('community.contentEyebrow')}
              </p>
              <p className="whitespace-pre-line text-sm leading-8 text-[var(--color-ink-soft)]">
                {post.content}
              </p>
            </div>

            {post.trip ? (
              <div className="space-y-4 rounded-[1.75rem] border border-[rgba(84,107,65,0.16)] bg-[rgba(255,255,255,0.78)] p-5">
                <div className="space-y-2">
                  <p className="eyebrow-text-xs text-[var(--color-forest)]">
                    {t('community.linkedTripEyebrow')}
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
                    {post.trip.name}
                  </h2>
                  <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t('community.linkedTripDescription')}
                  </p>
                </div>

                <Link
                  className={getButtonClasses()}
                  to={`/trips/${post.trip.id}`}
                >
                  {t('community.actions.viewLinkedTrip')}
                </Link>
              </div>
            ) : null}
          </div>

          <TripCoverImage
            alt={post.title}
            className="h-full min-h-80 rounded-[2rem]"
            src={resolveCommunityPostCoverImage(post)}
          />
        </div>
      </Card>
    </div>
  );
}
