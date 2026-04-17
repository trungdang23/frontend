export const DEFAULT_TRIP_COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';

export function resolveTripCoverImageUrl(coverImageUrl?: string | null) {
  const normalizedValue = coverImageUrl?.trim();

  return normalizedValue && normalizedValue.length > 0
    ? normalizedValue
    : DEFAULT_TRIP_COVER_IMAGE_URL;
}

export function getTripSummaryPreview(
  summaryNotes?: string | null,
  maxLength = 160,
) {
  const normalizedValue = summaryNotes?.trim().replace(/\s+/g, ' ');

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 3).trimEnd()}...`;
}
