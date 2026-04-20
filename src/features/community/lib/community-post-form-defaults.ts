import type { CommunityPostFormValues } from '@/features/community/lib/community-post-form-validators';

export function getCommunityPostFormDefaults(
  tripId = '',
): CommunityPostFormValues {
  return {
    title: '',
    content: '',
    coverImageUrl: '',
    tripId,
  };
}
