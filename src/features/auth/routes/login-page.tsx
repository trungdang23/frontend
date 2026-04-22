import { FormEvent, useState } from 'react';
import { Compass } from 'lucide-react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthBookScene } from '@/features/auth/components/auth-book-scene';
import { AuthField } from '@/features/auth/components/auth-field';
import { localizeAuthError } from '@/features/auth/lib/localize-auth-error';
import { readPostAuthPathFromState } from '@/features/auth/lib/resolve-post-auth-path';
import { useAuth } from '@/features/auth/session/use-auth';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';

const loginPhotoUrl =
  'https://images.unsplash.com/photo-1579613035165-708cc6bc87d4?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1400';

export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = readPostAuthPathFromState(location.state);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await auth.login({
        email: email.trim(),
        password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(localizeAuthError(error, t));
      } else {
        setSubmitError(t('auth.errors.loginUnavailable'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthBookScene>
      <form
        className="auth-notebook relative w-full max-w-[62rem] overflow-hidden"
        onSubmit={handleSubmit}
      >
        <div className="pointer-events-none absolute left-1/2 top-3 bottom-3 hidden w-8 -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(73,49,31,0.5),rgba(73,49,31,0.14)_45%,transparent_72%)] blur-md lg:block" />
        <div className="pointer-events-none absolute left-1/2 top-5 bottom-5 hidden w-px -translate-x-1/2 bg-[#4d3422]/30 lg:block" />

        <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
          <section className="auth-page auth-page-lines flex flex-col items-center justify-center gap-6 border-b border-[#dbcdb6] px-5 py-7 sm:px-8 sm:py-8 lg:border-b-0 lg:border-r lg:px-10">
            <div className="auth-photo-frame w-full max-w-[15rem] rotate-[-7deg] sm:max-w-[17rem]">
              <img
                alt=""
                className="h-[13rem] w-full rounded-[0.1rem] object-cover sm:h-[15rem]"
                src={loginPhotoUrl}
              />
              <div className="absolute -bottom-4 left-[-1.2rem] h-10 w-[5.5rem] rotate-[-28deg] rounded-sm bg-[#ecdfba]/92 shadow-[0_8px_14px_rgba(83,62,44,0.18)]" />
            </div>

            <div className="max-w-[16rem] text-center font-hand text-[1.9rem] leading-[1.02] text-[#231813] sm:max-w-[19rem] sm:text-[2.4rem]">
              <p className="inline-block border-b border-[#6c5848]/70 px-3 pb-2">
                {t('auth.login.quote')}
              </p>
            </div>
          </section>

          <section className="auth-page auth-page-lines relative flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="pointer-events-none absolute right-4 top-4 text-[#8d6843] sm:right-6 sm:top-5">
              <div className="auth-compass-badge">
                <Compass className="h-9 w-9" strokeWidth={1.5} />
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[18rem] flex-col gap-6 sm:max-w-[19.5rem]">
              <AuthField
                autoComplete="email"
                id="login-email"
                inputMode="email"
                label={t('common.labels.email')}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />

              <AuthField
                autoComplete="current-password"
                id="login-password"
                label={t('common.labels.password')}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />

              {submitError ? (
                <p className="auth-error-note" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col items-center gap-4 pt-1">
                <button
                  className="auth-washi-button w-full max-w-[15rem]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {t('auth.login.submitAction')}
                </button>

                <button
                  className="auth-stamp-button auth-stamp-button--small self-end"
                  onClick={() =>
                    navigate('/auth/register', {
                      state: location.state,
                    })
                  }
                  type="button"
                >
                  {t('auth.login.switchAction')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </form>
    </AuthBookScene>
  );
}
