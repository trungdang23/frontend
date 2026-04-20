import { z } from 'zod';

import type { CommunityPostCreatePayload } from '@/features/community/types/post';

type Translate = (key: string) => string;

export type CommunityPostFormValues = {
  title: string;
  content: string;
  coverImageUrl: string;
  tripId: string;
};

export function createCommunityPostFormSchema(t: Translate) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('community.validation.titleRequired'))
      .max(120, t('community.validation.titleLength')),
    content: z
      .string()
      .trim()
      .min(1, t('community.validation.contentRequired'))
      .max(20000, t('community.validation.contentLength')),
    coverImageUrl: z
      .string()
      .trim()
      .refine((value) => value.length === 0 || isHttpUrl(value), {
        message: t('community.validation.coverImageUrlInvalid'),
      }),
    tripId: z.string().trim(),
  });
}

export function mapCommunityPostFormValuesToPayload(
  values: CommunityPostFormValues,
): CommunityPostCreatePayload {
  const normalizedTripId = toNullableTrimmedValue(values.tripId);

  return {
    title: values.title.trim(),
    content: values.content.trim(),
    coverImageUrl: toNullableTrimmedValue(values.coverImageUrl),
    ...(normalizedTripId ? { tripId: normalizedTripId } : {}),
  };
}

function toNullableTrimmedValue(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function isHttpUrl(value: string) {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}
