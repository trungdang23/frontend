type RegisterTranslate = (key: string) => string;

type RegisterFormValues = {
  displayName: string;
  email: string;
  password: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterPassword(password: string, t: RegisterTranslate) {
  if (password.length < 8) {
    return t('auth.validation.passwordMin');
  }

  if (!/[A-Za-z]/.test(password)) {
    return t('auth.validation.passwordLetter');
  }

  if (!/\d/.test(password)) {
    return t('auth.validation.passwordNumber');
  }

  return null;
}

export function validateRegisterForm(values: RegisterFormValues, t: RegisterTranslate) {
  const displayName = values.displayName.trim();
  const email = values.email.trim();

  if (displayName.length < 2) {
    return t('auth.validation.displayNameMin');
  }

  if (displayName.length > 80) {
    return t('auth.validation.displayNameMax');
  }

  if (!EMAIL_PATTERN.test(email)) {
    return t('auth.validation.invalidEmail');
  }

  return validateRegisterPassword(values.password, t);
}
