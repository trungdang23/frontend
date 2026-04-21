import { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { SkipLink } from '@/shared/ui/skip-link';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
}>;

export function AuthShell({ children, description, eyebrow, footer, title }: AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <SkipLink />
      <main id="main-content" tabIndex={-1}>
        <div className="mx-auto mb-4 flex max-w-6xl justify-end sm:mb-5">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.2fr_0.9fr] lg:items-center lg:gap-8">
          <section className="hidden flex-col justify-between rounded-[2rem] bg-[rgba(84,107,65,0.92)] p-10 text-white shadow-[var(--shadow-soft)] lg:flex">
            <div className="space-y-5">
              <Link className="headline text-4xl" to="/">
                {t('common.brand')}
              </Link>
              <p className="eyebrow-text max-w-md text-white/65">
                {t('auth.shell.eyebrow')}
              </p>
            </div>

            <div className="space-y-4">
              <p className="headline max-w-lg text-4xl leading-tight xl:text-5xl">
                {t('auth.shell.title')}
              </p>
              <p className="max-w-md text-base leading-7 text-white/78">
                {t('auth.shell.description')}
              </p>
            </div>
          </section>

          <Card className="mx-auto w-full max-w-xl p-5 sm:p-8">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <div className="space-y-2 lg:hidden">
                  <Link className="headline text-3xl text-[var(--color-forest)]" to="/">
                    {t('common.brand')}
                  </Link>
                  <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t('auth.shell.eyebrow')}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="eyebrow-text text-[var(--color-forest)]">{eyebrow}</p>
                  <div className="space-y-2">
                    <h1 className="headline break-words text-3xl text-[var(--color-ink)] sm:text-4xl">
                      {title}
                    </h1>
                    <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
              {children}
              <div className="border-t border-[var(--color-border)] pt-5 text-sm leading-7 text-[var(--color-ink-soft)]">
                {footer}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
