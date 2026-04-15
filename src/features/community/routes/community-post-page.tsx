import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/shared/i18n/use-i18n';
import { SiteHeader } from '@/shared/ui/site-header';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';

export function CommunityPostPage() {
  const { postId } = useParams();
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageSection className="pt-12">
        <Card className="space-y-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-forest)]"
            to="/community"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.actions.backToCommunity')}
          </Link>
          <div className="space-y-3">
            <p className="eyebrow-text text-[var(--color-forest)]">{t('community.postPlaceholderEyebrow')}</p>
            <h1 className="headline text-4xl text-[var(--color-ink)]">
              {t('community.postPlaceholderTitle', { postId: postId || t('community.fallbackPostId') })}
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('community.postPlaceholderDescription')}
          </p>
        </Card>
      </PageSection>
    </div>
  );
}
