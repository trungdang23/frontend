import { BookOpenText, Image, PenLine } from 'lucide-react';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { useI18n } from '@/shared/i18n/use-i18n';

export function JournalPage() {
  const { t } = useI18n();

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.journal}
      mainId="journal-content"
    >
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <section className="paper-panel w-full max-w-4xl overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="space-y-4">
              <p className="section-label">{t('journalPage.eyebrow')}</p>
              <div className="space-y-3">
                <h1 className="font-display text-[2rem] leading-tight text-[#2c1f18] sm:text-[2.5rem]">
                  {t('journalPage.title')}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
                  {t('journalPage.description')}
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#bc956f]/26 bg-[linear-gradient(180deg,rgba(255,252,244,0.96),rgba(248,238,216,0.94))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_32px_rgba(96,72,50,0.1)]">
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                <article className="rounded-[1.25rem] bg-white/70 px-4 py-4 shadow-[0_10px_20px_rgba(96,72,50,0.08)]">
                  <PenLine className="h-5 w-5 text-[#a34f39]" />
                  <p className="mt-3 font-hand text-[1.7rem] leading-none text-[#71412e]">
                    {t('journalPage.cards.notesTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('journalPage.cards.notesDescription')}
                  </p>
                </article>

                <article className="rounded-[1.25rem] bg-white/70 px-4 py-4 shadow-[0_10px_20px_rgba(96,72,50,0.08)]">
                  <Image className="h-5 w-5 text-[#4e7f67]" />
                  <p className="mt-3 font-hand text-[1.7rem] leading-none text-[#71412e]">
                    {t('journalPage.cards.stickersTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('journalPage.cards.stickersDescription')}
                  </p>
                </article>

                <article className="rounded-[1.25rem] bg-white/70 px-4 py-4 shadow-[0_10px_20px_rgba(96,72,50,0.08)]">
                  <BookOpenText className="h-5 w-5 text-[#4a76a8]" />
                  <p className="mt-3 font-hand text-[1.7rem] leading-none text-[#71412e]">
                    {t('journalPage.cards.editorTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {t('journalPage.cards.editorDescription')}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
