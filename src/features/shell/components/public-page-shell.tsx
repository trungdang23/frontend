import type { PropsWithChildren } from 'react';
import { SharedFooter } from '@/features/shell/components/shared-footer';
import { SharedHeader } from '@/features/shell/components/shared-header';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

export const PUBLIC_PAGE_SHELL_CLASSNAME = 'page-backdrop relative flex h-[100dvh] flex-col items-center overflow-hidden';
export const PUBLIC_PAGE_MAIN_BASE_CLASSNAME = 'shell-scroll-hidden relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden';

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
    <div className={cn(PUBLIC_PAGE_SHELL_CLASSNAME, shellClassName)}>
      <a
        className="absolute left-4 top-4 z-[120] -translate-y-24 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href={`#${mainId}`}
      >
        {t('common.navigation.skipToContent')}
      </a>

      <SharedHeader />

      <main
        className={cn(PUBLIC_PAGE_MAIN_BASE_CLASSNAME, mainClassName)}
        id={mainId}
      >
        {children}
      </main>

      <SharedFooter />
    </div>
  );
}
