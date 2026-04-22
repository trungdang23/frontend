import {
  MapPinned,
  Sparkles,
} from 'lucide-react';
import { HomeFooter } from '@/features/home/components/home-footer';
import { PolaroidCluster } from '@/features/home/components/polaroid-cluster';
import { ScrapbookNav } from '@/features/home/components/scrapbook-nav';
import { VietnamMapBoard } from '@/features/home/components/vietnam-map-board';
import { useI18n } from '@/shared/i18n/use-i18n';

export function HomePage() {
  const { t } = useI18n();

  return (
    <div className="page-backdrop relative flex min-h-screen flex-col items-center overflow-x-hidden pb-0">
      <a
        className="absolute left-4 top-4 z-[120] -translate-y-24 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {t('common.navigation.skipToContent')}
      </a>

      <ScrapbookNav />

      <main
        className="relative grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-4 py-8 md:px-12 lg:grid-cols-[1.5fr_1fr]"
        id="main-content"
      >
        <section
          className="relative flex h-[720px] w-full items-center justify-center"
          id="home"
        >
          <div className="pointer-events-none relative z-[40] max-w-md text-center">
            <h1 className="text-shadow-custom font-title text-[50px] leading-[0.85] tracking-tight text-[#1a1a1a] uppercase md:text-[65px]">
              {t('home.hero.titleLine1')}
              <br />
              <span className="text-[0.88em]">{t('home.hero.titleLine2')}</span>
              <br />
              <span className="text-[1.08em]">{t('home.hero.titleLine3')}</span>
            </h1>

            <div className="absolute -top-10 left-[-15%] opacity-90">
              <div className="flex h-12 w-12 rotate-12 items-center justify-center rounded-full bg-yellow-400 text-[#1a1a1a] shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            <div className="absolute right-[-10%] top-[80%] opacity-80">
              <MapPinned className="h-10 w-10 text-[#c46a4d]" />
            </div>
          </div>

          <PolaroidCluster />
        </section>

        <div className="relative self-center pt-0 lg:pt-12">
          <VietnamMapBoard />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
