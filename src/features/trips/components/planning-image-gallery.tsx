type PlanningImageGalleryProps = {
  altPrefix: string;
  imageUrls: string[];
};

export function PlanningImageGallery({
  altPrefix,
  imageUrls,
}: PlanningImageGalleryProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {imageUrls.map((imageUrl, index) => (
        <div
          className="group relative overflow-hidden rounded-[1.35rem] bg-[var(--color-surface-strong)]"
          key={`${imageUrl}-${index}`}
        >
          <img
            alt={`${altPrefix} ${index + 1}`}
            className="h-44 w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105"
            loading="lazy"
            src={imageUrl}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.04),rgba(12,24,18,0.22))]" />
        </div>
      ))}
    </div>
  );
}
