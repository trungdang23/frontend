import { cn } from '@/shared/lib/cn';

type ProfileSampleCardProps = {
  badge: string;
  image: string;
  name: string;
  stats: Array<{
    labelLines: readonly string[];
    value: string;
  }>;
  summary: string;
};

export function ProfileSampleCard({
  badge,
  image,
  name,
  stats,
  summary,
}: ProfileSampleCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-[18rem] rotate-1 rounded-[0.75rem] border-2 border-[#e8d4b7] bg-[#fff7e8] p-5 shadow-[8px_10px_0_rgba(185,126,66,0.16),0_18px_28px_rgba(76,51,33,0.12)]">
      <span className="pointer-events-none absolute left-1/2 top-0 h-8 w-28 -translate-x-1/2 -translate-y-4 -rotate-2 bg-[#a8dfd5]/75 shadow-[0_5px_10px_rgba(80,115,104,0.16)]" />
      <div className="mb-3 flex justify-center -rotate-3">
        <img
          alt={name}
          className="h-28 w-28 -rotate-2 rounded-[0.55rem] border-4 border-white object-cover shadow-md"
          loading="lazy"
          src={image}
        />
      </div>

      <h2 className="mb-2 text-center font-cursive text-[1.85rem] font-bold leading-none text-[#251b15]">
        {name}
      </h2>

      <div className="mb-4 flex justify-center">
        <span className="rounded-full border border-[#d7b17a] bg-[#fff1d9] px-2.5 py-0.5 font-marker text-[0.85rem] font-bold text-[#6b4938]">
          {badge}
        </span>
      </div>

      <p className="mb-5 text-center font-marker text-[1rem] leading-tight text-[#6b4938]">
        {summary}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <div
            className={cn(
              'border-l-2 border-dashed border-amber-300 p-2 text-center',
              index === stats.length - 1 && 'border-r-2',
            )}
            key={`${stat.labelLines.join('-')}-${index}`}
          >
            <div className="font-cursive text-[1.85rem] font-bold leading-none text-[#6b4938]">{stat.value}</div>
            <div className="font-marker text-[0.72rem] font-bold uppercase leading-tight text-[#4f4138]">
              {stat.labelLines[0]}
              <br />
              {stat.labelLines[1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
