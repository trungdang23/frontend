import {
  MapPinned,
  Sparkles,
} from 'lucide-react';
import { PolaroidCluster } from '@/features/home/components/polaroid-cluster';
import { VietnamMapBoard } from '@/features/home/components/vietnam-map-board';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { useI18n } from '@/shared/i18n/use-i18n';

export function HomePage() {
  const { t } = useI18n();

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.home}
    >
        <section
          className="relative flex h-[24rem] w-full items-center justify-center sm:h-[29rem] lg:h-[37rem] lg:-translate-x-16"
          id="home"
        >
          <div className="pointer-events-none relative z-[40] mx-auto w-fit max-w-none text-center lg:absolute lg:left-[39%] lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <h1 className="text-shadow-custom inline-flex flex-col items-center gap-1 font-title text-[2.55rem] leading-[0.82] tracking-tight text-[#1a1a1a] uppercase sm:text-[3.35rem] md:text-[3.8rem] lg:text-[3.7rem] xl:text-[4rem]">
              <span className="block whitespace-nowrap">{t('home.hero.titleLine1')}</span>
              <span className="block whitespace-nowrap text-[0.88em]">{t('home.hero.titleLine2')}</span>
              <span className="block whitespace-nowrap text-[1.08em]">{t('home.hero.titleLine3')}</span>
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
    </PublicPageShell>
  );
}
