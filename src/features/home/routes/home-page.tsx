import {
  ArrowRight,
  Compass,
  MapPinned,
  Sparkles,
} from 'lucide-react';
import { HomeFooter } from '@/features/home/components/home-footer';
import { HomePreviewGrid } from '@/features/home/components/home-preview-grid';
import { PolaroidCluster } from '@/features/home/components/polaroid-cluster';
import { ScrapbookNav } from '@/features/home/components/scrapbook-nav';
import { VietnamMapBoard } from '@/features/home/components/vietnam-map-board';
import { useI18n } from '@/shared/i18n/use-i18n';

export function HomePage() {
  const { t } = useI18n();

  return (
    <div className="page-backdrop min-h-screen overflow-x-clip">
      <a
        className="absolute left-4 top-4 z-[70] -translate-y-24 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {t('common.navigation.skipToContent')}
      </a>

      <ScrapbookNav />

      <main
        className="mx-auto flex max-w-7xl flex-col gap-14 px-4 pb-16 pt-6 sm:px-6 lg:px-8"
        id="main-content"
      >
        <section
          className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start"
          id="home"
        >
          <div className="space-y-6">
            <div className="paper-panel overflow-hidden px-4 py-6 sm:px-8 sm:py-8 lg:min-h-[46rem]">
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_72%)]" />

              <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,253,246,0.78),rgba(252,244,227,0.86))] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:min-h-[36rem] lg:min-h-[40rem]">
                <div className="scrapbook-sticker left-5 top-5 h-12 w-12 rotate-[-12deg] text-[#8a6120] sm:h-14 sm:w-14">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="scrapbook-sticker bottom-7 right-6 h-11 w-11 rotate-[12deg] text-[#315d71] sm:h-12 sm:w-12">
                  <MapPinned className="h-5 w-5" />
                </div>

                <div className="relative z-20 max-w-[22rem] text-center sm:max-w-[25rem]">
                  <p className="section-label justify-center">{t('home.hero.eyebrow')}</p>

                  <h1 className="mt-5 font-display text-[3.3rem] uppercase leading-[0.84] tracking-[0.08em] text-[var(--color-ink)] sm:text-[4rem] xl:text-[4.6rem]">
                    <span className="block">{t('home.hero.titleLine1')}</span>
                    <span className="block text-[0.88em]">{t('home.hero.titleLine2')}</span>
                    <span className="block text-[1.03em]">{t('home.hero.titleLine3')}</span>
                  </h1>

                  <p className="mt-5 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
                    {t('home.hero.description')}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_24px_rgba(32,25,22,0.16)] transition-transform hover:-translate-y-0.5"
                      href="#journal"
                    >
                      {t('home.hero.primaryCta')}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(122,75,57,0.14)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white"
                      href="#community"
                    >
                      {t('home.hero.secondaryCta')}
                    </a>
                  </div>
                </div>

                <PolaroidCluster />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="paper-panel px-5 py-5">
                <p className="section-label">{t('home.hero.readyLabel')}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                  {t('home.hero.readyValue')}
                </p>
              </article>

              <article className="paper-panel px-5 py-5">
                <p className="section-label">{t('home.hero.surfaceLabel')}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                  {t('home.hero.surfaceValue')}
                </p>
              </article>
            </div>
          </div>

          <div className="space-y-6 lg:pt-10">
            <VietnamMapBoard />

            <aside className="paper-panel overflow-hidden px-6 py-6">
              <span className="tape-tab tape-tab--sky left-8 top-[-0.7rem] rotate-[-4deg]" />

              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(153,205,232,0.22)] text-[#315d71]">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="section-label">{t('home.floatingNote.eyebrow')}</p>
                  <h2 className="mt-4 font-display text-[2rem] leading-tight text-[var(--color-ink)]">
                    {t('home.floatingNote.title')}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t('home.floatingNote.description')}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <HomePreviewGrid />
      </main>

      <HomeFooter />
    </div>
  );
}
