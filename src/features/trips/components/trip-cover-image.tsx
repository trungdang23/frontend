import { useEffect, useState } from 'react';
import { resolveTripCoverImageUrl, DEFAULT_TRIP_COVER_IMAGE_URL } from '@/features/trips/lib/trip-media';
import { cn } from '@/shared/lib/cn';

type TripCoverImageProps = {
  alt: string;
  className?: string;
  imgClassName?: string;
  src?: string | null;
};

export function TripCoverImage({
  alt,
  className,
  imgClassName,
  src,
}: TripCoverImageProps) {
  const resolvedSrc = resolveTripCoverImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        alt={alt}
        className={cn('h-full w-full object-cover', imgClassName)}
        onError={() => {
          if (currentSrc !== DEFAULT_TRIP_COVER_IMAGE_URL) {
            setCurrentSrc(DEFAULT_TRIP_COVER_IMAGE_URL);
          }
        }}
        src={currentSrc}
      />
    </div>
  );
}
