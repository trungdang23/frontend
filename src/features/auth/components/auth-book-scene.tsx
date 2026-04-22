import { PropsWithChildren } from 'react';
import {
  Compass,
  MapPinned,
  Plane,
} from 'lucide-react';

export function AuthBookScene({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="auth-grain" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[4%] top-[42%] hidden -rotate-[18deg] lg:block">
          <div className="h-44 w-4 rounded-full bg-[linear-gradient(180deg,#4d4f52_0%,#2d2f31_48%,#8b9198_100%)] shadow-[0_18px_30px_rgba(39,31,24,0.24)]" />
          <div className="absolute bottom-[-0.7rem] left-1/2 h-12 w-3 -translate-x-1/2 rounded-full bg-[#c8ced4]" />
        </div>

        <div className="absolute bottom-[12%] left-[9%] hidden text-[#8c6a45]/55 lg:block">
          <div className="auth-compass-badge">
            <Compass className="h-9 w-9" strokeWidth={1.5} />
          </div>
        </div>

        <div className="absolute right-[12%] top-[10%] hidden text-[#8c6a45]/72 lg:block">
          <div className="auth-compass-badge">
            <Compass className="h-9 w-9" strokeWidth={1.5} />
          </div>
        </div>

        <div className="absolute right-[9%] top-[58%] hidden rotate-[22deg] lg:block">
          <div className="h-20 w-14 rounded-[0.8rem] bg-[linear-gradient(180deg,#72513a_0%,#5b3f2d_100%)] shadow-[0_14px_24px_rgba(57,38,26,0.24)]">
            <div className="absolute inset-x-2 top-2 h-10 rounded-t-[0.55rem] border border-[#e8d1af]/52" />
          </div>
          <div className="absolute bottom-[-1.1rem] left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-[#8b6448]" />
        </div>

        <Plane
          className="absolute right-[18%] top-[12%] hidden rotate-[10deg] text-[#8f8577]/55 lg:block"
          size={34}
          strokeWidth={1.6}
        />
        <MapPinned
          className="absolute left-[13%] top-[16%] hidden -rotate-[8deg] text-[#bb7158]/38 lg:block"
          size={34}
          strokeWidth={1.4}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[76rem] items-center justify-center">
        {children}
      </div>
    </main>
  );
}

