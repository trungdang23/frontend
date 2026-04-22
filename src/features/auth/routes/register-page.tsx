import { FormEvent, useState } from 'react';
import {
  Building2,
  Camera,
  Mountain,
  Waves,
} from 'lucide-react';
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

export function RegisterPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [likesMountain, setLikesMountain] = useState(true);
  const [likesBeach, setLikesBeach] = useState(true);
  const [likesCity, setLikesCity] = useState(true);
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
      await auth.register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(localizeAuthError(error, t));
      } else {
        setSubmitError(t('auth.errors.registerUnavailable'));
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
        <div className="pointer-events-none absolute right-[-1.05rem] top-1/2 hidden h-20 w-14 -translate-y-1/2 rounded-r-[1.15rem] bg-[linear-gradient(180deg,#6a4327_0%,#4f311c_100%)] shadow-[0_16px_28px_rgba(57,38,26,0.22)] lg:block" />

        <div className="grid lg:grid-cols-2">
          <section className="auth-page auth-page-lines relative border-b border-[#dbcdb6] px-5 py-7 sm:px-8 sm:py-8 lg:border-b-0 lg:border-r lg:px-10">
            <div className="absolute left-6 top-4 sm:left-8 sm:top-5">
              <span className="inline-flex rounded-full border border-[#8b6244]/60 bg-[#f4cf8f] px-4 py-1 font-hand text-[1.7rem] leading-none text-[#4d2d1b] shadow-[0_8px_14px_rgba(90,62,40,0.16)] sm:text-[1.9rem]">
                {t('auth.register.welcome')}
              </span>
            </div>

            <div className="mx-auto flex w-full max-w-[18rem] flex-col gap-5 pt-9 sm:max-w-[19.5rem] sm:pt-10">
              <AuthField
                autoComplete="name"
                id="register-display-name"
                label={t('auth.register.nameLabel')}
                maxLength={120}
                minLength={2}
                name="displayName"
                onChange={(event) => setDisplayName(event.target.value)}
                required
                type="text"
                value={displayName}
              />

              <AuthField
                autoComplete="email"
                id="register-email"
                inputMode="email"
                label={t('common.labels.email')}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />

              <AuthField
                autoComplete="new-password"
                id="register-password"
                label={t('common.labels.password')}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}"
                required
                type="password"
                value={password}
              />

              <div className="pt-3">
                <button
                  className="auth-stamp-button auth-stamp-button--wide justify-center text-[#a34f39]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {t('auth.register.submitAction')}
                </button>
              </div>

              {submitError ? (
                <p className="auth-error-note" role="alert">
                  {submitError}
                </p>
              ) : null}
            </div>
          </section>

          <section className="auth-page relative flex flex-col justify-center gap-6 px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="space-y-3">
              <p className="font-hand text-[1.95rem] leading-none text-[#251913] sm:text-[2.35rem]">
                {t('auth.register.interestsTitle')}
              </p>

              <div className="space-y-3 font-hand text-[1.55rem] text-[#2e2018] sm:text-[1.9rem]">
                <label className="flex items-center gap-2.5">
                  <input
                    checked={likesMountain}
                    className="h-5 w-5 rounded border-[#8b6244]"
                    onChange={(event) => setLikesMountain(event.target.checked)}
                    type="checkbox"
                  />
                  <Mountain className="h-6 w-6 text-[#5e6c4f]" strokeWidth={1.7} />
                  <span>{t('auth.register.mountainLabel')}</span>
                </label>

                <label className="flex items-center gap-2.5">
                  <input
                    checked={likesBeach}
                    className="h-5 w-5 rounded border-[#8b6244]"
                    onChange={(event) => setLikesBeach(event.target.checked)}
                    type="checkbox"
                  />
                  <Waves className="h-6 w-6 text-[#5c89a4]" strokeWidth={1.7} />
                  <span>{t('auth.register.beachLabel')}</span>
                </label>

                <label className="flex items-center gap-2.5">
                  <input
                    checked={likesCity}
                    className="h-5 w-5 rounded border-[#8b6244]"
                    onChange={(event) => setLikesCity(event.target.checked)}
                    type="checkbox"
                  />
                  <Building2 className="h-6 w-6 text-[#9c8651]" strokeWidth={1.7} />
                  <span>{t('auth.register.cityLabel')}</span>
                </label>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[11rem] rotate-[-3deg] bg-white p-3 pb-8 shadow-[0_18px_32px_rgba(68,49,34,0.16)]">
              <div className="flex aspect-square items-center justify-center rounded-[0.15rem] bg-[#111]">
                <Camera className="h-9 w-9 text-white/35" strokeWidth={1.4} />
              </div>
              <p className="mt-3 text-center font-hand text-[1.65rem] leading-none text-[#453128]">
                {t('auth.register.avatarLabel')}
              </p>
            </div>

            <button
              className="auth-stamp-button auth-stamp-button--small self-end"
              onClick={() =>
                navigate('/auth/login', {
                  state: location.state,
                })
              }
              type="button"
            >
              {t('auth.register.switchAction')}
            </button>
          </section>
        </div>
      </form>
    </AuthBookScene>
  );
}
