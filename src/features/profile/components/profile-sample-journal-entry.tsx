type ProfileSampleJournalEntryProps = {
  image: string;
  metadata: string;
  rotationClass?: string;
  title: string;
};

export function ProfileSampleJournalEntry({
  image,
  metadata,
  rotationClass,
  title,
}: ProfileSampleJournalEntryProps) {
  return (
    <article className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${rotationClass}`}>
      <img
        alt={title}
        className="mb-3 h-48 w-full rounded-lg object-cover"
        loading="lazy"
        src={image}
      />
      <h3 className="mb-1 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{metadata}</p>
    </article>
  );
}
