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
} from '@/features/shell/content/public-chrome-content';
import type { AccentTone } from '@/features/shell/content/public-chrome-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const stampIconMap = {
  facebook: Facebook,
  instagram: Instagram,
  music: Music2,
  youtube: Youtube,
} as const;

const stampToneStyles: Record<AccentTone, CSSProperties> = {
  coral: {
    ['--stamp-base' as string]: '#e89a81',
    ['--stamp-hover' as string]: '#ffd5c6',
    ['--stamp-edge' as string]: '#8e4d3a',
    ['--stamp-ink' as string]: '#5e2418',
    ['--stamp-glow' as string]: 'rgba(221, 137, 110, 0.42)',
  },
  leaf: {
    ['--stamp-base' as string]: '#abd2ab',
    ['--stamp-hover' as string]: '#dff2d4',
    ['--stamp-edge' as string]: '#4d7753',
    ['--stamp-ink' as string]: '#24452a',
    ['--stamp-glow' as string]: 'rgba(121, 176, 128, 0.38)',
  },
  sky: {
    ['--stamp-base' as string]: '#adcde9',
    ['--stamp-hover' as string]: '#def3ff',
    ['--stamp-edge' as string]: '#496a90',
    ['--stamp-ink' as string]: '#1f3e61',
    ['--stamp-glow' as string]: 'rgba(119, 165, 208, 0.38)',
  },
  sun: {
    ['--stamp-base' as string]: '#ecc57f',
    ['--stamp-hover' as string]: '#ffe3ab',
    ['--stamp-edge' as string]: '#936120',
    ['--stamp-ink' as string]: '#5e3b05',
    ['--stamp-glow' as string]: 'rgba(225, 180, 83, 0.4)',
  },
};

export function SharedFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-auto w-full flex-none overflow-visible py-1.5 sm:py-2" id="footer">
      <div className="pointer-events-none absolute left-0 top-[-8px] z-0 h-[calc(100%+8px)] w-full">
        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1440 300">
          <defs>
            <filter id="paper-shadow" height="140%" width="140%" x="-20%" y="-20%">
              <feDropShadow dx="0" dy="-2" floodOpacity="0.25" stdDeviation="4" />
            </filter>
          </defs>
          <path
            d="M0,300 L0,15 L10,12 L15,18 L25,10 L35,14 L45,8 L55,16 L65,11 L75,19 L85,9 L95,15 L105,7 L115,18 L125,11 L135,20 L150,10 L165,18 L180,8 L195,16 L210,10 L225,19 L240,9 L255,15 L270,7 L285,18 L300,11 L315,20 L330,10 L345,18 L360,8 L375,16 L390,10 L405,19 L420,9 L435,15 L450,7 L465,18 L480,11 L495,20 L510,10 L525,18 L540,8 L555,16 L570,10 L585,19 L600,9 L615,15 L630,7 L645,18 L660,11 L675,20 L690,10 L705,18 L720,8 L735,16 L750,10 L765,19 L780,9 L795,15 L810,7 L825,18 L840,11 L855,20 L870,10 L885,18 L900,8 L915,16 L930,10 L945,19 L960,9 L975,15 L990,7 L1005,18 L1020,11 L1035,20 L1050,10 L1065,18 L1080,8 L1095,16 L1110,10 L1125,19 L1140,9 L1155,15 L1170,7 L1185,18 L1200,11 L1215,20 L1230,10 L1245,18 L1260,8 L1275,16 L1290,10 L1305,19 L1320,9 L1335,15 L1350,7 L1365,18 L1380,11 L1395,20 L1410,10 L1425,18 L1440,15 L1440,300 Z"
            fill="#f8f8f8"
            filter="url(#paper-shadow)"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10 mix-blend-overlay">
        <svg height="100%" preserveAspectRatio="none" viewBox="0 0 1000 200" width="100%">
          <path
            d="M0,50 Q250,20 500,80 T1000,40"
            fill="none"
            opacity="0.3"
            stroke="black"
            strokeWidth="0.5"
          />
          <path
            d="M100,150 Q400,180 700,120 T1000,160"
            fill="none"
            opacity="0.4"
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="relative z-20 flex w-full flex-col items-center justify-between gap-2 px-4 sm:px-6 md:flex-row md:gap-3 md:px-10 xl:px-14">
        <div className="group relative inline-block cursor-default px-5 py-1 transition-transform duration-300 hover:scale-105 md:px-6">
          <div className="pointer-events-none absolute inset-0 z-0">
            <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 220 90">
              <path
                d="M120,15 C80,12 25,18 25,45 C25,72 75,82 120,82 C165,82 205,72 205,45 C205,18 160,12 105,15"
                fill="none"
                opacity="0.9"
                stroke="#0f172a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <span className="relative z-10 select-none pb-0.5 font-cursive text-[1.8rem] tracking-normal text-slate-900 sm:text-[2.8rem]">
            Journey
          </span>
        </div>

        <div className="flex gap-2 sm:gap-2.5 md:gap-3">
          {socialStamps.map((social) => {
            const Icon = stampIconMap[social.id];

            return (
              <div className="relative" key={social.id}>
                <div
                  aria-label={t(social.labelKey)}
                  className={cn('footer-social-stamp cursor-pointer')}
                  role="img"
                  style={
                    {
                      ['--stamp-rotate' as string]: `${social.rotate}deg`,
                      ...stampToneStyles[social.tone],
                    } as CSSProperties
                  }
                >
                  <Icon aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        <nav
          aria-label={t('home.footer.navigationLabel')}
          className="flex flex-wrap justify-center gap-x-8 gap-y-0.5 font-cursive text-[1.15rem] text-slate-900 sm:text-[1.4rem] md:justify-end md:gap-x-10 md:text-[1.6rem]"
        >
          {footerLinks.map((link) => (
            <a
              className="group relative transition-colors duration-300 hover:text-amber-700"
              href={link.href}
              key={link.labelKey}
            >
              {t(link.labelKey)}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-700 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
