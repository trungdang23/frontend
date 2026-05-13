import type { CSSProperties } from 'react';
import {
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CommunityFeedCard } from '@/features/community/lib/community-feed-presenters';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

type CommunityFeedCardProps = {
  card: CommunityFeedCard;
};

export function CommunityFeedCard({ card }: CommunityFeedCardProps) {
  const { t } = useI18n();
  const showAuthorName = Boolean(card.authorName?.trim());
  const className =
    'group relative flex flex-col items-center bg-white p-3 pb-8 text-left shadow-[4px_4px_15px_rgba(0,0,0,0.15)] transition-transform duration-300 [transform:rotate(var(--card-rotate))] hover:z-10 hover:[transform:rotate(0deg)_scale(1.02)]';
  const style = {
    ['--card-rotate' as string]: `${card.rotate}deg`,
  } as CSSProperties;

  const content = (
    <>
      <div
        className={cn(
          'absolute -top-3 left-1/2 z-20 h-6 w-16 -translate-x-1/2 rotate-1 shadow-sm',
          card.tapeClassName,
        )}
      />

      <div className="mb-4 aspect-[4/5] w-full overflow-hidden border border-black/5 bg-[#efe7d8]">
        {card.coverImageUrl ? (
          <img
            alt={card.displayTitle}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            src={card.coverImageUrl}
          />
        ) : (
          <div className="relative h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_34%),linear-gradient(180deg,_#f7efdf,_#ead9bd)]">
            <div className="absolute left-5 top-5 h-16 w-16 rotate-[-8deg] rounded-[1rem] border border-[rgba(122,75,57,0.15)] bg-white/60 shadow-[0_10px_20px_rgba(96,72,50,0.08)]" />
            <div className="absolute bottom-6 right-6 h-24 w-24 rotate-[7deg] rounded-[1.2rem] border border-[rgba(122,75,57,0.12)] bg-white/40 shadow-[0_14px_24px_rgba(96,72,50,0.08)]" />
          </div>
        )}
      </div>

      <div className="w-full px-2 text-left">
        <p className="mb-2 inline-flex rounded-full bg-[#fff1d9] px-2.5 py-1 font-marker text-[0.78rem] font-bold uppercase leading-none tracking-normal text-[#6b4938]">
          {t(`community.sources.${card.source}`)}
        </p>
        <h2 className="line-clamp-1 font-hand text-[1.9rem] leading-[0.95] text-slate-900">
          {card.displayTitle}
        </h2>

        {/* <p className="mt-2 line-clamp-2 min-h-[2.8rem] text-sm leading-relaxed text-slate-600">
          {card.excerpt}
        </p> */}

        <div className="mt-4 flex items-center justify-between gap-3 text-slate-600">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-black/10 bg-gray-200">
              <img
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                src={card.avatarUrl}
              />
            </div>
            {showAuthorName ? (
              <p className="min-w-0 truncate text-xs font-semibold text-slate-800">{card.authorName}</p>
            ) : null}
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
      </div>
    </>
  );

  if (card.href) {
    return (
      <Link className={className} style={style} to={card.href}>
        {content}
      </Link>
    );
  }

  return (
    <article className={className} style={style}>
      {content}
    </article>
  );
}
