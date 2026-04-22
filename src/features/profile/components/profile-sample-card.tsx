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
    <div className="mx-auto w-full max-w-[18rem] rotate-1 rounded-lg border-2 border-amber-200 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(217,119,6,0.2)]">
      <div className="mb-3 flex justify-center -rotate-3">
        <img
          alt={name}
          className="h-28 w-28 -rotate-2 rounded-lg border-4 border-white object-cover shadow-md"
          loading="lazy"
          src={image}
        />
      </div>

      <h2 className="mb-2 text-center font-serif text-xl font-bold text-gray-900">
        {name}
      </h2>

      <div className="mb-4 flex justify-center">
        <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
          {badge}
        </span>
      </div>

      <p className="mb-5 text-center font-serif text-sm italic text-gray-700">
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
            <div className="font-serif text-2xl font-bold text-amber-900">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter text-gray-600">
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
