import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().trim().email(t('auth.validation.invalidEmail')),
    password: z.string().min(8, t('auth.validation.passwordMin')),
  });
}

type LoginSchema = ReturnType<typeof createLoginSchema>;
type LoginFormValues = z.infer<LoginSchema>;

function getDescribedBy(...ids: Array<string | undefined>) {
  const describedBy = ids.filter(Boolean).join(' ');

  return describedBy.length > 0 ? describedBy : undefined;
}

export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const loginSchema = createLoginSchema(t);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const nextPath = location.state?.from?.pathname || '/app';
  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      await auth.login(parsed.data);
      navigate(nextPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(localizeAuthError(error, t));
        return;
      }

      setSubmitError(t('auth.errors.loginUnavailable'));
    }
  });

  return (
    <AuthShell
      description={t('auth.login.description')}
      eyebrow={t('auth.login.eyebrow')}
      footer={
        <>
          {t('auth.login.footerQuestion')}{' '}
          <Link className="font-semibold text-[var(--color-forest)]" to="/auth/register">
            {t('auth.login.footerAction')}
          </Link>
        </>
      }
      title={t('auth.login.title')}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthStatusBanner message={auth.notice} tone={auth.noticeTone} />
        <AuthStatusBanner message={submitError} tone="danger" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="login-email">
            {t('common.labels.email')}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.email ? emailErrorId : undefined,
            )}
            hasError={Boolean(errors.email)}
            id="login-email"
            placeholder={t('common.placeholders.email')}
            type="email"
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-sm text-[var(--color-danger)]" id={emailErrorId}>
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="login-password">
            {t('common.labels.password')}
          </label>
          <PasswordInput
            aria-describedby={getDescribedBy(
              errors.password ? passwordErrorId : undefined,
            )}
            hasError={Boolean(errors.password)}
            id="login-password"
            placeholder={t('common.placeholders.password')}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--color-danger)]" id={passwordErrorId}>
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t('common.actions.loggingIn') : t('common.actions.login')}
        </Button>
      </form>
    </AuthShell>
  );
}
