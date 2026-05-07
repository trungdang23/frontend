import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  validateUserAvatarFile,
} from '@/shared/lib/avatar-file-validation';
import {
  validateRegisterForm,
  validateRegisterPassword,
} from '@/features/auth/lib/register-validation';

const t = (key: string) => key;

describe('register validation', () => {
  it('returns the password length message before calling the API', () => {
    expect(validateRegisterPassword('abc123', t)).toBe('auth.validation.passwordMin');
  });

  it('returns the password letter message for numeric-only passwords', () => {
    expect(validateRegisterPassword('12345678', t)).toBe('auth.validation.passwordLetter');
  });

  it('returns the password number message for letter-only passwords', () => {
    expect(validateRegisterPassword('abcdefgh', t)).toBe('auth.validation.passwordNumber');
  });

  it('accepts passwords that satisfy the product rule', () => {
    expect(validateRegisterPassword('abc12345', t)).toBeNull();
  });

  it('validates the register form with localized message keys', () => {
    expect(
      validateRegisterForm(
        {
          displayName: 'A',
          email: 'user@example.com',
          password: 'abc12345',
        },
        t,
      ),
    ).toBe('auth.validation.displayNameMin');

    expect(
      validateRegisterForm(
        {
          displayName: 'Nguyen Van A',
          email: 'not-an-email',
          password: 'abc12345',
        },
        t,
      ),
    ).toBe('auth.validation.invalidEmail');

    expect(
      validateRegisterForm(
        {
          displayName: 'Nguyen Van A',
          email: 'user@example.com',
          password: 'abc12345',
        },
        t,
      ),
    ).toBeNull();
  });

  it('validates avatar files before upload', () => {
    expect(
      validateUserAvatarFile(
        new File(['avatar'], 'avatar.png', { type: 'image/png' }),
        t,
      ),
    ).toBeNull();
    expect(
      validateUserAvatarFile(
        new File(['avatar'], 'avatar.txt', { type: 'text/plain' }),
        t,
      ),
    ).toBe('auth.validation.avatarUnsupported');
  });
});
