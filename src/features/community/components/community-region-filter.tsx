import { cn } from '@/shared/lib/cn';
import type { CommunityRegion } from '@/features/community/lib/community-feed-presenters';

type CommunityRegionFilterProps = {
  activeRegion: CommunityRegion;
  color: string;
  label: string;
  region: Exclude<CommunityRegion, 'All'>;
  onToggle: (region: Exclude<CommunityRegion, 'All'>) => void;
  rotateClassName: string;
};

export function CommunityRegionFilter({
  activeRegion,
  color,
  label,
  onToggle,
  region,
  rotateClassName,
}: CommunityRegionFilterProps) {
  const isActive = activeRegion === region;

  return (
    <button
      className={cn(
        'relative min-w-[8rem] px-7 py-3 transition-transform duration-300 hover:scale-105 active:scale-95 sm:min-w-[10rem] sm:px-10',
        rotateClassName,
      )}
      onClick={() => onToggle(region)}
      type="button"
    >
      <span className="sr-only">{label}</span>

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_6px_12px_rgba(96,72,50,0.18)] transition-transform duration-300"
        preserveAspectRatio="none"
        viewBox="0 0 200 70"
      >
        <path
          d="M12,35 C12,12 35,8 100,8 C165,8 188,12 188,35 C188,58 165,62 100,62 C35,62 12,58 12,35 Z"
          fill="#fffdf8"
        />
        <path
          d="M18,35 C18,18 38,14 100,14 C162,14 182,18 182,35 C182,52 162,56 100,56 C38,56 18,52 18,35 Z"
          fill={color}
          fillOpacity={isActive ? '0.98' : '0.42'}
          stroke="#171717"
          strokeWidth="2.5"
        />
      </svg>

      <span className="relative z-10 block font-hand text-[1.9rem] leading-none text-slate-900 sm:text-[2.4rem]">
        {label}
      </span>
    </button>
  );
}
