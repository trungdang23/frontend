import { Link } from 'react-router-dom';
import { BookOpenText, Share2, Trash2 } from 'lucide-react';

type ProfileSampleJournalEntryProps = {
  actionHref?: string;
  actionLabel?: string;
  deleteActionLabel?: string;
  image: string;
  isDeleting?: boolean;
  metadata: string;
  onDelete?: () => void;
  onShare?: () => void;
  rotationClass?: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  shareActionLabel?: string;
  shareBadgeLabel?: string;
  summary?: string;
  title: string;
};

export function ProfileSampleJournalEntry({
  actionHref,
  actionLabel,
  deleteActionLabel,
  image,
  isDeleting = false,
  metadata,
  onDelete,
  onShare,
  rotationClass,
  secondaryActionHref,
  secondaryActionLabel,
  shareActionLabel,
  shareBadgeLabel,
  summary,
  title,
}: ProfileSampleJournalEntryProps) {
  return (
    <article
      className={`relative rounded-[0.65rem] border border-[#eadbc5] bg-[#fffdfa] p-4 shadow-[0_14px_26px_rgba(76,51,33,0.12)] ${rotationClass}`}
    >
      <span className="pointer-events-none absolute left-1/2 top-0 h-7 w-24 -translate-x-1/2 -translate-y-3 -rotate-2 bg-[#f4cf8f]/65 shadow-[0_5px_10px_rgba(90,62,40,0.12)]" />
      {shareBadgeLabel ? (
        <span className="absolute right-3 top-3 rounded-full border border-[#3a5d25]/30 bg-[#f1ffd8] px-3 py-1 font-marker text-[0.8rem] font-bold leading-none text-[#31521c] shadow-[0_4px_0_#c7df9a]">
          {shareBadgeLabel}
        </span>
      ) : null}
      <img alt={title} className="mb-3 h-48 w-full rounded-[0.45rem] object-cover" loading="lazy" src={image} />
      <h3 className="mb-1 font-cursive text-[1.5rem] font-bold leading-none text-[#251b15]">{title}</h3>
      <p className="font-marker text-[0.98rem] leading-tight text-[#6b4938]">{metadata}</p>
      {summary ? <p className="mt-2 line-clamp-2 font-marker text-[0.95rem] leading-tight text-[#3d332b]">{summary}</p> : null}
      {(actionHref && actionLabel) || (secondaryActionHref && secondaryActionLabel) || onShare || onDelete ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actionHref && actionLabel ? (
            <Link
              className="inline-flex rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker text-[0.98rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
              to={actionHref}
            >
              {actionLabel}
            </Link>
          ) : null}
          {secondaryActionHref && secondaryActionLabel ? (
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker text-[0.98rem] font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5 hover:bg-[#ffedc5] focus:outline-none focus:ring-2 focus:ring-[#d7a957]/25"
              to={secondaryActionHref}
            >
              <BookOpenText className="h-4 w-4" strokeWidth={2.3} />
              {secondaryActionLabel}
            </Link>
          ) : null}
          {onShare && shareActionLabel ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/30 bg-[#eef8d8] px-4 py-2 font-marker text-[0.98rem] font-bold leading-none text-[#31521c] shadow-[0_5px_0_#c6d999] transition hover:-translate-y-0.5 hover:bg-[#f7ffe8] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/25"
              onClick={onShare}
              type="button"
            >
              <Share2 className="h-4 w-4" strokeWidth={2.3} />
              {shareActionLabel}
            </button>
          ) : null}
          {onDelete && deleteActionLabel ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-4 py-2 font-marker text-[0.98rem] font-bold leading-none text-[#b42318] shadow-[0_5px_0_#f0b8b0] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
              disabled={isDeleting}
              onClick={onDelete}
              type="button"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.3} />
              {deleteActionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
