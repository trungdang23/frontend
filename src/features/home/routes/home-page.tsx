import {
  MapPinned,
  Sparkles,
} from 'lucide-react';
import { PolaroidCluster } from '@/features/home/components/polaroid-cluster';
import { VietnamMapModel } from '@/features/home/components/vietnam-map-model';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { useI18n } from '@/shared/i18n/use-i18n';

export function HomePage() {
  const { t } = useI18n();

  return (
    <PublicPageShell
      allowOverflowXVisible
      mainClassName={publicPageMainLayouts.home}
    >
      <section
        className="home-hero-stage"
        id="home"
      >
        <div className="home-hero-title">
          <h1 className="home-hero-heading text-shadow-custom">
            <span className="block whitespace-nowrap">{t('home.hero.titleLine1')}</span>
            <span className="block whitespace-nowrap text-[0.88em]">{t('home.hero.titleLine2')}</span>
            <span className="block whitespace-nowrap text-[1.08em]">{t('home.hero.titleLine3')}</span>
          </h1>

          <div className="home-hero-sparkle">
            <div className="home-hero-sparkle-badge">
              <Sparkles className="h-[1em] w-[1em]" />
            </div>
          </div>

          <div className="home-hero-map-pin">
            <MapPinned className="h-[1em] w-[1em] text-[#c46a4d]" />
          </div>
        </div>

        <PolaroidCluster />
      </section>

      <div className="home-map-panel">
        <VietnamMapModel />
      </div>
    </PublicPageShell>
  );
}
