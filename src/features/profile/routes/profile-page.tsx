import { PrivatePageShell } from '@/features/shell/components/private-page-shell';
import { useI18n } from '@/shared/i18n/use-i18n';

export function ProfilePage() {
  const { t } = useI18n();

  return (
    <PrivatePageShell
      active="profile"
      description={t('profile.description')}
      eyebrow={t('profile.eyebrow')}
      title={t('profile.title')}
    >
      <article className="rounded-[1.5rem] border border-[#c9a27a]/24 bg-white/62 p-5 shadow-[0_14px_26px_rgba(96,72,50,0.08)]">
        <p className="font-hand text-[1.9rem] leading-none text-[#6c4835]">
          {t('profile.summary')}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
          {t('shell.description', {
            name: t('common.userFallback'),
          })}
        </p>
      </article>
    </PrivatePageShell>
  );
}

