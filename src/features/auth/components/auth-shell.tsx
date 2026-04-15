import { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
}>;

export function AuthShell({ children, description, eyebrow, footer, title }: AuthShellProps) {
  const { t } = useI18n();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto mb-4 flex max-w-6xl justify-end">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid lg:grid-cols-[1.2fr_0.9fr]">
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
            <p className="headline max-w-lg text-5xl leading-tight">{t('auth.shell.title')}</p>
            <p className="max-w-md text-base leading-7 text-white/78">
              {t('auth.shell.description')}
            </p>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="eyebrow-text text-[var(--color-forest)]">{eyebrow}</p>
              <div className="space-y-2">
                <h1 className="headline text-4xl text-[var(--color-ink)]">{title}</h1>
                <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{description}</p>
              </div>
            </div>
            {children}
            <div className="border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-ink-soft)]">
              {footer}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
