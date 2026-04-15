import { ApiError } from '@/shared/api/api-error';

type Translate = (key: string) => string;

export function localizeAuthError(error: ApiError, t: Translate) {
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return t('auth.errors.invalidCredentials');
  }

  if (
    error.status === 409 ||
    error.message === 'Email is already registered.' ||
    error.details === 'Email is already registered.'
  ) {
    return t('auth.errors.emailAlreadyRegistered');
  }

  return error.message;
}
