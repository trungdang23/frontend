import type { CommunityPost } from '@/features/community/types/post';
import type { TripJournalResult } from '@/features/journal/types/journal';
import type { Trip, TripVisibility } from '@/features/trips/types/trip';
import {
  profileEntryRotationClasses,
  profileFallbackGalleryImages,
} from '@/features/profile/content/profile-sample-content';

export type ProfileGridEntry = {
  actionHref?: string;
  actionLabel?: string;
  id?: string;
  image: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  shareBadgeLabel?: string;
  metadata: string;
  rotationClass: string;
  summary?: string;
  title: string;
};

export type ProfileShareBadgeLabels = Partial<Record<TripVisibility, string>>;

function resolveFallbackImage(index: number) {
  return profileFallbackGalleryImages[index % profileFallbackGalleryImages.length];
}

function resolveRotationClass(index: number) {
  return profileEntryRotationClasses[index % profileEntryRotationClasses.length];
}

export function formatProfileDate(dateInput: string) {
  const date = new Date(`${dateInput.slice(0, 10)}T00:00:00.000Z`);

  return `${date.getUTCDate()} Tháng ${date.getUTCMonth() + 1}, ${date.getUTCFullYear()}`;
}

export function formatTripDuration(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const diffInDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
  );

  if (diffInDays % 7 === 0) {
    const weeks = diffInDays / 7;

    return `${weeks} tuần`;
  }

  return `${diffInDays} ngày`;
}

export function buildProfilePostEntries(
  posts: CommunityPost[],
  postedLabel: string,
): ProfileGridEntry[] {
  return posts.map((post, index) => ({
    image: post.coverImageUrl || post.trip?.coverImageUrl || resolveFallbackImage(index),
    metadata: `${formatProfileDate(post.createdAt)} • ${postedLabel}`,
    rotationClass: resolveRotationClass(index),
    title: post.title,
  }));
}

export function buildProfileJournalEntries(
  journals: TripJournalResult[],
  actionLabel?: string,
  shareBadgeLabels: ProfileShareBadgeLabels = {},
): ProfileGridEntry[] {
  return journals.map(({ journal, trip }, index) => ({
    actionHref: `/app/journal?tripId=${encodeURIComponent(trip.id)}`,
    actionLabel,
    id: trip.id,
    image:
      resolveJournalCoverImage(journal.objects) ||
      trip.coverImageUrl ||
      resolveFallbackImage(index),
    metadata: `${formatProfileDate(journal.updatedAt)} • ${journal.objects.length} mảnh`,
    rotationClass: resolveRotationClass(index),
    shareBadgeLabel: resolveShareBadgeLabel(trip.visibility, shareBadgeLabels),
    summary: trip.destination || trip.summaryNotes || undefined,
    title: trip.name,
  }));
}

export function buildProfileTripEntries(
  trips: Trip[],
  actionLabel?: string,
  secondaryActionLabel?: string,
  shareBadgeLabels: ProfileShareBadgeLabels = {},
): ProfileGridEntry[] {
  return trips.map((trip, index) => ({
    actionHref: `/app/planner?tripId=${encodeURIComponent(trip.id)}`,
    actionLabel,
    id: trip.id,
    image: trip.coverImageUrl || resolveFallbackImage(index),
    metadata: `${formatProfileDate(trip.startDate)} • ${formatTripDuration(trip.startDate, trip.endDate)}`,
    rotationClass: resolveRotationClass(index),
    secondaryActionHref: `/app/journal?tripId=${encodeURIComponent(trip.id)}`,
    secondaryActionLabel,
    shareBadgeLabel: resolveShareBadgeLabel(trip.visibility, shareBadgeLabels),
    summary: trip.destination || trip.summaryNotes || undefined,
    title: trip.name,
  }));
}

function resolveShareBadgeLabel(
  visibility: TripVisibility,
  shareBadgeLabels: ProfileShareBadgeLabels,
) {
  return visibility === 'private' ? undefined : shareBadgeLabels[visibility];
}

function resolveJournalCoverImage(objects: TripJournalResult['journal']['objects']) {
  const photo = objects.find((object) => object.type === 'photo');
  const imageUrl = photo?.props.imageUrl;

  return typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
}
