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
        className="relative grid w-full max-w-[72rem] flex-1 grid-cols-1 items-center gap-4 px-4 pb-2 pt-2 sm:px-6 sm:pb-3 lg:grid-cols-[1.32fr_0.92fr] lg:gap-6 lg:px-10"
        id="main-content"
      >
        <section
          className="relative flex h-[24rem] w-full items-center justify-center sm:h-[29rem] lg:h-[35rem] lg:-translate-x-12"
          id="home"
        >
          <div className="pointer-events-none relative z-[40] max-w-md text-center lg:absolute lg:left-[43%] lg:top-1/2 lg:max-w-[19rem] lg:-translate-x-1/2 lg:-translate-y-1/2">
            <h1 className="text-shadow-custom font-title text-[2.7rem] leading-[0.85] tracking-tight text-[#1a1a1a] uppercase sm:text-[3.5rem] md:text-[4rem]">
              {t('home.hero.titleLine1')}
              <br />
              <span className="text-[0.88em]">{t('home.hero.titleLine2')}</span>
              <br />
              <span className="text-[1.08em]">{t('home.hero.titleLine3')}</span>
            </h1>

            <div className="absolute -top-6 left-[-10%] opacity-90 sm:-top-10 sm:left-[-15%]">
              <div className="flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-yellow-400 text-[#1a1a1a] shadow-md sm:h-12 sm:w-12">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="absolute right-[-6%] top-[80%] opacity-80 sm:right-[-10%]">
              <MapPinned className="h-8 w-8 text-[#c46a4d] sm:h-10 sm:w-10" />
            </div>
          </div>

          <PolaroidCluster />
        </section>

        <div className="relative mx-auto w-full max-w-[17rem] self-center pt-0 sm:max-w-[20rem] lg:max-w-[24rem] lg:pt-4">
          <VietnamMapBoard />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
