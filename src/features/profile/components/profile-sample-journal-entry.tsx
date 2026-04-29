import { Link } from 'react-router-dom';

type ProfileSampleJournalEntryProps = {
  actionHref?: string;
  actionLabel?: string;
  image: string;
  metadata: string;
  rotationClass?: string;
  summary?: string;
  title: string;
};

export function ProfileSampleJournalEntry({
  actionHref,
  actionLabel,
  image,
  metadata,
  rotationClass,
  summary,
  title,
}: ProfileSampleJournalEntryProps) {
  return (
    <article
      className={`relative rounded-[0.65rem] border border-[#eadbc5] bg-[#fffdfa] p-4 shadow-[0_14px_26px_rgba(76,51,33,0.12)] ${rotationClass}`}
    >
      <span className="pointer-events-none absolute left-1/2 top-0 h-7 w-24 -translate-x-1/2 -translate-y-3 -rotate-2 bg-[#f4cf8f]/65 shadow-[0_5px_10px_rgba(90,62,40,0.12)]" />
      <img alt={title} className="mb-3 h-48 w-full rounded-[0.45rem] object-cover" loading="lazy" src={image} />
      <h3 className="mb-1 font-cursive text-[1.5rem] font-bold leading-none text-[#251b15]">{title}</h3>
      <p className="font-marker text-[0.98rem] leading-tight text-[#6b4938]">{metadata}</p>
      {summary ? <p className="mt-2 line-clamp-2 font-marker text-[0.95rem] leading-tight text-[#3d332b]">{summary}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker text-[0.98rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 hover:bg-[#c6ec88] focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
          to={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
