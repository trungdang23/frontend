import type { ProfileSampleEntry } from '@/features/profile/content/profile-sample-content';

export function ProfileSampleJournalEntry({
  date,
  duration,
  image,
  rotationClass,
  title,
}: ProfileSampleEntry) {
  return (
    <article className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${rotationClass}`}>
      <img
        alt={title}
        className="mb-4 h-64 w-full rounded-lg object-cover"
        loading="lazy"
        src={image}
      />
      <h3 className="mb-1 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">
        {date}
        {' '}
        •
        {' '}
        {duration}
      </p>
    </article>
  );
}
