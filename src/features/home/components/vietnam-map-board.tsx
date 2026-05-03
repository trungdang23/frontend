import { MapPin } from 'lucide-react';
import { mapStops } from '@/features/home/content/home-content';
import type { AccentTone } from '@/features/shell/content/public-chrome-content';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';

const pinToneClasses: Record<AccentTone, string> = {
  coral: 'text-red-500',
  leaf: 'text-orange-400',
  sky: 'text-blue-500',
  sun: 'text-blue-400',
};

const hotspotLabelPositionClasses: Record<string, string> = {
  hanoi: 'right-full mr-2 origin-right',
  hue: 'right-full mr-2 origin-right',
  'nha-trang': 'right-full mr-2 origin-right',
  'sai-gon': 'right-full mr-2 origin-right',
  sapa: 'left-full ml-2 origin-left',
};

export function VietnamMapBoard() {
  const { t } = useI18n();

  return (
    <section
      className="home-map-board relative mx-auto w-full max-w-[480px] aspect-[1/1.4] overflow-visible p-4"
      id="map-board"
    >
      <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-sm border border-[#d4b483] bg-[#f4e4bc] shadow-inner rotate-1" />

      <div className="absolute inset-0 -rotate-1 rounded-sm border border-[#e5c9a3] bg-[#fdf2d0] shadow-xl">
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/stained-paper.png')",
          }}
        />

        <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center">
          <img
            alt="Bản đồ Việt Nam"
            className="h-full w-full object-contain opacity-90 mix-blend-multiply contrast-110"
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1596402184320-417d7108b4eb?auto=format&fit=crop&q=80&w=800"
            style={{ filter: 'sepia(0.3)' }}
          />
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-amber-900/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 -translate-x-20 translate-y-20 rounded-full bg-amber-900/5 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        {mapStops.map((stop) => (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            key={stop.id}
            style={{ left: stop.x, top: stop.y }}
          >
            <div className={cn('relative', pinToneClasses[stop.tone])}>
              <MapPin className="h-6 w-6 fill-current drop-shadow-sm" />

              <div
                className={cn(
                  'home-map-hotspot-label paper-shadow absolute top-0 w-[180px] rounded-lg border border-slate-100/60 bg-white p-3 scale-[0.88] transition-transform group-hover:scale-100',
                  hotspotLabelPositionClasses[stop.id],
                )}
              >
                <h3 className="font-hand text-base font-bold leading-none text-slate-800">
                  {t(stop.titleKey)}
                </h3>
                <p className="mt-2 font-marker text-[10px] italic leading-tight text-slate-500">
                  {t(stop.descriptionKey)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
