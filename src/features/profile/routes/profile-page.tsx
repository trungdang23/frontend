import { ProfileSampleCard } from '@/features/profile/components/profile-sample-card';
import { ProfileSampleJournalEntry } from '@/features/profile/components/profile-sample-journal-entry';
import { profileSampleEntries } from '@/features/profile/content/profile-sample-content';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';

export function ProfilePage() {
  return (
    <PublicPageShell
      mainClassName="w-full px-4 pb-10 pt-2 sm:px-6 lg:px-10"
      mainId="profile-content"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:w-[20rem] lg:flex-none">
          <ProfileSampleCard />
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap gap-8 border-b border-gray-200">
            <button
              className="border-b-2 border-gray-900 pb-2 font-bold text-gray-900"
              type="button"
            >
              Nhật ký của tôi
            </button>
            <button
              className="pb-2 font-medium text-gray-400 hover:text-gray-600"
              type="button"
            >
              Kế hoạch đã lưu
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {profileSampleEntries.map((entry) => (
              <ProfileSampleJournalEntry
                date={entry.date}
                duration={entry.duration}
                image={entry.image}
                key={entry.title}
                rotationClass={entry.rotationClass}
                title={entry.title}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className="rounded-full bg-amber-800 px-8 py-3 font-bold text-white"
              type="button"
            >
              XEM THÊM KÝ ỨC
            </button>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
