export const USER_AVATAR_ACCEPT = 'image/gif,image/jpeg,image/png,image/webp';
export const MAX_USER_AVATAR_BYTES = 2 * 1024 * 1024;

const SUPPORTED_USER_AVATAR_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

type AvatarFileTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function validateUserAvatarFile(
  file: File,
  t: AvatarFileTranslate,
) {
  if (!SUPPORTED_USER_AVATAR_TYPES.has(file.type)) {
    return t('auth.validation.avatarUnsupported');
  }

  if (file.size > MAX_USER_AVATAR_BYTES) {
    return t('auth.validation.avatarTooLarge', {
      size: formatAvatarByteSize(MAX_USER_AVATAR_BYTES),
    });
  }

  return null;
}

export function formatAvatarByteSize(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}
