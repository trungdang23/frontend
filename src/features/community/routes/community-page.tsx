import { Link } from 'react-router-dom';
import { useI18n } from '@/shared/i18n/use-i18n';
import { SiteHeader } from '@/shared/ui/site-header';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';

export function CommunityPage() {
  const { t } = useI18n();
  const featuredPosts = [
    {
      id: 'ha-giang-spring-loop',
      title: t('community.posts.haGiang.title'),
      summary: t('community.posts.haGiang.summary'),
    },
    {
      id: 'hue-food-notes',
      title: t('community.posts.hue.title'),
      summary: t('community.posts.hue.summary'),
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageSection className="pt-12">
        <Card className="space-y-4">
          <p className="eyebrow-text text-[var(--color-forest)]">{t('community.eyebrow')}</p>
          <h1 className="headline text-4xl text-[var(--color-ink)]">{t('community.title')}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">{t('community.description')}</p>
        </Card>
      </PageSection>

      <PageSection className="grid gap-5 lg:grid-cols-2">
        {featuredPosts.map((post) => (
          <Card className="space-y-4" key={post.id}>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.95),rgba(153,173,122,0.75))] p-8 text-white">
              <p className="eyebrow-text text-white/70">{t('community.sampleStory')}</p>
              <h2 className="headline mt-3 text-3xl">{post.title}</h2>
            </div>
            <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{post.summary}</p>
            <Link className={getButtonClasses()} to={`/community/${post.id}`}>
              {t('common.actions.viewStory')}
            </Link>
          </Card>
        ))}
      </PageSection>
    </div>
  );
}
