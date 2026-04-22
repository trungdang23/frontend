import type { CSSProperties } from 'react';
import {
  Facebook,
  Instagram,
  Music2,
  Youtube,
} from 'lucide-react';
import {
  footerLinks,
  socialStamps,
} from '@/features/home/content/home-content';
import type { AccentTone } from '@/features/home/content/home-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const stampIconMap = {
  facebook: Facebook,
  instagram: Instagram,
  music: Music2,
  youtube: Youtube,
} as const;

const stampToneClasses: Record<AccentTone, string> = {
  coral: 'bg-[#bf6a56]',
  leaf: 'bg-[#4e8760]',
  sky: 'bg-[#446f8c]',
  sun: 'bg-[#b7862f]',
};

export function HomeFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-16 pb-12 pt-24" id="footer">
      <svg
        className="absolute left-0 top-0 h-20 w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
      >
        <path
          d="M0 56L20 52 38 60 56 48 74 58 92 46 110 59 128 49 146 60 164 51 182 62 200 50 218 60 236 49 254 63 272 54 290 61 308 49 326 59 344 47 362 58 380 48 398 62 416 53 434 61 452 49 470 60 488 50 506 62 524 53 542 61 560 49 578 60 596 48 614 59 632 49 650 61 668 52 686 60 704 50 722 62 740 48 758 58 776 49 794 60 812 50 830 62 848 51 866 60 884 49 902 62 920 53 938 61 956 49 974 59 992 48 1010 60 1028 50 1046 62 1064 51 1082 60 1100 49 1118 61 1136 53 1154 60 1172 49 1190 59 1208 48 1226 60 1244 51 1262 61 1280 49 1298 59 1316 48 1334 60 1352 50 1370 62 1388 52 1406 58 1424 49 1440 56V120H0Z"
          fill="rgba(255, 249, 238, 0.96)"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="paper-panel overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative inline-flex self-start">
              <svg
                className="absolute inset-[-1.2rem] h-[calc(100%+2.4rem)] w-[calc(100%+2.4rem)]"
                preserveAspectRatio="none"
                viewBox="0 0 220 90"
              >
                <path
                  d="M122 18C84 14 26 18 24 46c-1 28 49 36 97 36 45 0 82-8 88-34 6-25-28-37-80-34"
                  fill="none"
                  stroke="rgba(32,25,22,0.88)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
              <div className="relative z-10 px-10 py-4">
                <p className="font-hand text-3xl font-bold text-[var(--color-warm-brown)]">
                  Journey
                </p>
                <h2 className="font-display text-5xl leading-none text-[var(--color-ink)]">
                  Journey
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {socialStamps.map((social) => {
                const Icon = stampIconMap[social.id];

                return (
                  <div
                    aria-label={t(social.labelKey)}
                    className={cn(
                      'stamp-button',
                      stampToneClasses[social.tone],
                    )}
                    key={social.id}
                    role="img"
                    style={
                      {
                        ['--stamp-rotate' as string]: `${social.rotate}deg`,
                      } as CSSProperties
                    }
                  >
                    <div className="absolute left-1 right-1 top-[-0.35rem] flex justify-around">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" key={index} />
                      ))}
                    </div>
                    <div className="absolute bottom-[-0.35rem] left-1 right-1 flex justify-around">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" key={index} />
                      ))}
                    </div>
                    <Icon className="relative z-10 h-5 w-5" />
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('home.footer.tagline')}
          </p>

          <div className="mt-8 flex flex-col gap-4 border-t border-[rgba(122,75,57,0.12)] pt-6 md:flex-row md:items-center md:justify-between">
            <nav
              aria-label={t('home.footer.navigationLabel')}
              className="flex flex-wrap gap-6"
            >
              {footerLinks.map((link) => (
                <a
                  className="font-hand text-[1.65rem] font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-warm-brown)]"
                  href={link.href}
                  key={link.labelKey}
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>

            <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
              {t('home.footer.profileNote')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
