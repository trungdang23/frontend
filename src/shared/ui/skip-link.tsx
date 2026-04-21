import { useI18n } from '@/shared/i18n/use-i18n';

type SkipLinkProps = {
  targetId?: string;
};

export function SkipLink({ targetId = 'main-content' }: SkipLinkProps) {
  const { t } = useI18n();

  return (
    <a className="skip-link" href={`#${targetId}`}>
      {t('common.navigation.skipToContent')}
    </a>
  );
}
