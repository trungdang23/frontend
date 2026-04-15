import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { localizeAuthError } from '@/features/auth/lib/localize-auth-error';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';
import { ApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t('auth.validation.displayNameMin'))
      .max(50, t('auth.validation.displayNameMax')),
    email: z.string().trim().email(t('auth.validation.invalidEmail')),
    password: z
      .string()
      .min(8, t('auth.validation.passwordMin'))
      .regex(/[A-Za-z]/, t('auth.validation.passwordLetter'))
      .regex(/[0-9]/, t('auth.validation.passwordNumber')),
  });
}

type RegisterSchema = ReturnType<typeof createRegisterSchema>;
type RegisterFormValues = z.infer<RegisterSchema>;

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const registerSchema = createRegisterSchema(t);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'displayName' || field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      await auth.register(parsed.data);
      navigate('/app', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(localizeAuthError(error, t));
        return;
      }

      setSubmitError(t('auth.errors.registerUnavailable'));
    }
  });

  return (
    <AuthShell
      description={t('auth.register.description')}
      eyebrow={t('auth.register.eyebrow')}
      footer={
        <>
          {t('auth.register.footerQuestion')}{' '}
          <Link className="font-semibold text-[var(--color-forest)]" to="/auth/login">
            {t('auth.register.footerAction')}
          </Link>
        </>
      }
      title={t('auth.register.title')}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthStatusBanner message={submitError} tone="danger" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-display-name">
            {t('common.labels.displayName')}
          </label>
          <Input
            hasError={Boolean(errors.displayName)}
            id="register-display-name"
            placeholder={t('common.placeholders.displayName')}
            type="text"
            {...register('displayName')}
          />
          {errors.displayName ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.displayName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-email">
            {t('common.labels.email')}
          </label>
          <Input
            hasError={Boolean(errors.email)}
            id="register-email"
            placeholder={t('common.placeholders.email')}
            type="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-[var(--color-danger)]">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-password">
            {t('common.labels.password')}
          </label>
          <PasswordInput
            hasError={Boolean(errors.password)}
            id="register-password"
            placeholder={t('common.placeholders.registerPassword')}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t('common.actions.registering') : t('common.actions.register')}
        </Button>
      </form>
    </AuthShell>
  );
}
