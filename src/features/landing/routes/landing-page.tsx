import { ArrowRight, Compass, NotebookPen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/shared/i18n/use-i18n';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';
import { SiteHeader } from '@/shared/ui/site-header';

export function LandingPage() {
  const { t } = useI18n();
  const featureCards = [
    {
      icon: NotebookPen,
      title: t('landing.features.plan.title'),
      description: t('landing.features.plan.description'),
    },
    {
      icon: Compass,
      title: t('landing.features.experience.title'),
      description: t('landing.features.experience.description'),
    },
    {
      icon: Users,
      title: t('landing.features.community.title'),
      description: t('landing.features.community.description'),
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <PageSection className="pt-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="eyebrow-text text-[var(--color-forest)]">{t('landing.eyebrow')}</p>
              <div className="space-y-4">
                <h1 className="headline max-w-4xl text-5xl leading-tight text-[var(--color-ink)] sm:text-6xl">
                  {t('landing.title')}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[var(--color-ink-soft)]">
                  {t('landing.description')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className={getButtonClasses()} to="/auth/register">
                  <span className="inline-flex items-center gap-2">
                    {t('common.actions.register')}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link className={getButtonClasses('secondary')} to="/community">
                  {t('landing.secondaryCta')}
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.92),rgba(153,173,122,0.8))] p-8 text-white">
                <p className="eyebrow-text text-white/72">{t('landing.phaseEyebrow')}</p>
                <h2 className="headline mt-3 text-4xl">{t('landing.phaseTitle')}</h2>
                <p className="mt-4 text-sm leading-7 text-white/78">{t('landing.phaseDescription')}</p>
              </div>
              <div className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
                  <p className="eyebrow-text text-[var(--color-forest)]">{t('landing.readyNowLabel')}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{t('landing.readyNowValue')}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
                  <p className="eyebrow-text text-[var(--color-forest)]">
                    {t('landing.nextDependencyLabel')}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{t('landing.nextDependencyValue')}</p>
                </div>
              </div>
            </Card>
          </div>
        </PageSection>

        <PageSection className="grid gap-5 lg:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card className="space-y-4" key={card.title}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,107,65,0.1)] text-[var(--color-forest)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="headline text-3xl text-[var(--color-ink)]">{card.title}</h2>
                  <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{card.description}</p>
                </div>
              </Card>
            );
          })}
        </PageSection>
      </main>
    </div>
  );
}
