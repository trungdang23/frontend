import {
  profileSampleCardContent,
  profileSampleStats,
} from '@/features/profile/content/profile-sample-content';
import { cn } from '@/shared/lib/cn';

export function ProfileSampleCard() {
  return (
    <div className="mx-auto w-full max-w-[20rem] rotate-1 rounded-lg border-2 border-amber-200 bg-amber-50 p-6 shadow-[4px_4px_0px_0px_rgba(217,119,6,0.2)]">
      <div className="mb-4 flex justify-center -rotate-3">
        <img
          alt={profileSampleCardContent.alt}
          className="h-32 w-32 -rotate-2 rounded-lg border-4 border-white object-cover shadow-md"
          loading="lazy"
          src={profileSampleCardContent.image}
        />
      </div>

      <h2 className="mb-2 text-center font-serif text-xl font-bold text-gray-900">
        {profileSampleCardContent.name}
      </h2>

      <div className="mb-4 flex justify-center">
        <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
          {profileSampleCardContent.badge}
        </span>
      </div>

      <p className="mb-8 text-center font-serif text-sm italic text-gray-700">
        {profileSampleCardContent.quote}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {profileSampleStats.map((stat, index) => (
          <div
            className={cn(
              'border-l-2 border-dashed border-amber-300 p-2 text-center',
              index === profileSampleStats.length - 1 && 'border-r-2',
            )}
            key={stat.value}
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
