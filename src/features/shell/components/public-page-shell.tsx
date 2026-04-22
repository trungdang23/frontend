import type { PropsWithChildren } from 'react';
import { SharedFooter } from '@/features/shell/components/shared-footer';
import { SharedHeader } from '@/features/shell/components/shared-header';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

type PublicPageShellProps = PropsWithChildren<{
  mainClassName?: string;
  shellClassName?: string;
  mainId?: string;
}>;

export function PublicPageShell({
  children,
  mainClassName,
  mainId = 'main-content',
  shellClassName,
}: PublicPageShellProps) {
  const { t } = useI18n();

  return (
    <div className={cn('page-backdrop relative flex min-h-screen flex-col items-center overflow-x-hidden pb-0', shellClassName)}>
      <a
        className="absolute left-4 top-4 z-[120] -translate-y-24 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href={`#${mainId}`}
      >
        {t('common.navigation.skipToContent')}
      </a>

      <SharedHeader />

      <main
        className={cn('relative w-full flex-1', mainClassName)}
        id={mainId}
      >
        {children}
      </main>

      <SharedFooter />
    </div>
  );
}
