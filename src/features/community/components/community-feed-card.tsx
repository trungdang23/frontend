import type { CSSProperties } from 'react';
import {
  Heart,
  MessageCircle,
} from 'lucide-react';
import type { CommunityFeedCard } from '@/features/community/lib/community-feed-presenters';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

type CommunityFeedCardProps = {
  card: CommunityFeedCard;
};

export function CommunityFeedCard({ card }: CommunityFeedCardProps) {
  const { formatDate, t } = useI18n();
  const authorName = card.post.author.displayName || t('community.authorFallback');

  return (
    <article
      className="group relative flex flex-col items-center bg-white p-3 pb-8 shadow-[4px_4px_15px_rgba(0,0,0,0.15)] transition-transform duration-300 [transform:rotate(var(--card-rotate))] hover:z-10 hover:[transform:rotate(0deg)_scale(1.02)]"
      style={
        {
          ['--card-rotate' as string]: `${card.rotate}deg`,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          'absolute -top-3 left-1/2 z-20 h-6 w-16 -translate-x-1/2 rotate-1 shadow-sm',
          card.tapeClassName,
        )}
      />

      <div className="mb-4 aspect-[4/5] w-full overflow-hidden border border-black/5 bg-[#efe7d8]">
        {card.coverImageUrl ? (
          <img
            alt={card.post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            src={card.coverImageUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_34%),linear-gradient(180deg,_#f7efdf,_#ead9bd)] px-5 text-center">
            <div className="rounded-[1.2rem] border border-[rgba(122,75,57,0.18)] bg-white/70 px-4 py-5 shadow-[0_10px_20px_rgba(96,72,50,0.1)]">
              <p className="font-hand text-[1.8rem] leading-[0.9] text-[var(--color-warm-brown)]">
                {card.post.title}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full px-2 text-left">
        <p className="font-marker text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-warm-red)]">
          {t('community.cardEyebrow')}
        </p>

        <h2 className="mt-2 font-hand text-[2rem] leading-[0.92] text-slate-900">
          {card.post.title}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-[2.8rem] text-sm leading-relaxed text-slate-600">
          {card.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 text-slate-600">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-black/10 bg-gray-200">
              <img
                alt={authorName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                src={card.avatarUrl}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{authorName}</p>
              <p className="truncate text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                {formatDate(card.post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-red-400 text-red-400" />
              <span className="text-[0.72rem] font-semibold">{card.decorativeLikeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[0.72rem] font-semibold">{card.decorativeCommentCount}</span>
            </div>
          </div>
        </div>

        {card.post.trip ? (
          <div className="mt-3 inline-flex max-w-full items-center rounded-full border border-[rgba(122,75,57,0.18)] bg-[rgba(255,248,235,0.96)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-warm-brown)]">
            <span className="truncate">{card.post.trip.name}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
