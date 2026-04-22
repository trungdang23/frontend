import {
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { listMyPosts } from '@/features/community/api/posts-api';
import { ProfileSampleCard } from '@/features/profile/components/profile-sample-card';
import { ProfileSampleJournalEntry } from '@/features/profile/components/profile-sample-journal-entry';
import { profilePlaceholderPhotoUrl } from '@/features/profile/content/profile-sample-content';
import {
  buildProfilePostEntries,
  buildProfileTripEntries,
  formatProfileDate,
} from '@/features/profile/lib/profile-presenters';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { listTrips } from '@/features/trips/api/trips-api';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';

const PROFILE_POST_QUERY = {
  page: 0,
  size: 100,
  sort: 'createdAt,desc' as const,
};

const PROFILE_TRIP_QUERY = {
  page: 0,
  size: 100,
  sort: 'startDate,desc' as const,
};

type ProfileTab = 'journal' | 'plans';

function ProfileStateCard({ message }: { message: string }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white/80 px-5 py-10 text-center shadow-sm sm:col-span-2">
      <p className="text-sm text-gray-600">{message}</p>
    </article>
  );
}

export function ProfilePage() {
  const auth = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ProfileTab>('journal');
  const [visibleCount, setVisibleCount] = useState(2);
  const postsQuery = useQuery({
    queryFn: ({ signal }) => listMyPosts(PROFILE_POST_QUERY, { signal }),
    queryKey: ['community', 'posts', 'mine', PROFILE_POST_QUERY],
  });
  const tripsQuery = useQuery({
    queryFn: ({ signal }) => listTrips(PROFILE_TRIP_QUERY, { signal }),
    queryKey: ['trips', 'list', 'profile', PROFILE_TRIP_QUERY],
  });

  const postEntries = buildProfilePostEntries(
    postsQuery.data?.data || [],
    t('profile.meta.posted'),
  );
  const tripEntries = buildProfileTripEntries(tripsQuery.data?.data || []);
  const activeEntries = activeTab === 'journal' ? postEntries : tripEntries;
  const activeQuery = activeTab === 'journal' ? postsQuery : tripsQuery;
  const visibleEntries = activeEntries.slice(0, visibleCount);
  const publicTripCount = (tripsQuery.data?.data || []).filter(
    (trip) => trip.visibility === 'public',
  ).length;
  const joinedDate = auth.user?.createdAt
    ? formatProfileDate(auth.user.createdAt)
    : t('profile.memberSinceFallback');

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.profile}
      mainId="profile-content"
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-[20rem] lg:flex-none">
          <ProfileSampleCard
            badge={t('profile.badge')}
            image={profilePlaceholderPhotoUrl}
            name={auth.user?.displayName || t('common.userFallback')}
            stats={[
              {
                labelLines: [t('profile.stats.postsLine1'), t('profile.stats.postsLine2')],
                value: String(postsQuery.data?.meta.totalElements || 0),
              },
              {
                labelLines: [t('profile.stats.plansLine1'), t('profile.stats.plansLine2')],
                value: String(tripsQuery.data?.meta.totalElements || 0),
              },
              {
                labelLines: [t('profile.stats.publicLine1'), t('profile.stats.publicLine2')],
                value: String(publicTripCount),
              },
            ]}
            summary={t('profile.memberSince', { date: joinedDate })}
          />
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap gap-8 border-b border-gray-200">
            <button
              className={activeTab === 'journal'
                ? 'border-b-2 border-gray-900 pb-2 font-bold text-gray-900'
                : 'pb-2 font-medium text-gray-400 hover:text-gray-600'}
              onClick={() => {
                setActiveTab('journal');
                setVisibleCount(2);
              }}
              type="button"
            >
              {t('profile.tabs.journal')}
            </button>
            <button
              className={activeTab === 'plans'
                ? 'border-b-2 border-gray-900 pb-2 font-bold text-gray-900'
                : 'pb-2 font-medium text-gray-400 hover:text-gray-600'}
              onClick={() => {
                setActiveTab('plans');
                setVisibleCount(2);
              }}
              type="button"
            >
              {t('profile.tabs.plans')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {activeQuery.isLoading ? (
              <ProfileStateCard message={t('profile.states.loading')} />
            ) : null}

            {!activeQuery.isLoading && activeQuery.isError ? (
              <ProfileStateCard message={t('profile.loadError')} />
            ) : null}

            {!activeQuery.isLoading && !activeQuery.isError && visibleEntries.length === 0 ? (
              <ProfileStateCard
                message={activeTab === 'journal'
                  ? t('profile.states.postsEmpty')
                  : t('profile.states.plansEmpty')}
              />
            ) : null}

            {!activeQuery.isLoading && !activeQuery.isError
              ? visibleEntries.map((entry) => (
                  <ProfileSampleJournalEntry
                    image={entry.image}
                    key={`${activeTab}-${entry.title}-${entry.metadata}`}
                    metadata={entry.metadata}
                    rotationClass={entry.rotationClass}
                    title={entry.title}
                  />
                ))
              : null}
          </div>

          {visibleEntries.length < activeEntries.length ? (
            <div className="mt-8 flex justify-center">
              <button
                className="rounded-full bg-amber-800 px-8 py-3 font-bold text-white"
                onClick={() => setVisibleCount((current) => current + 4)}
                type="button"
              >
                {activeTab === 'journal'
                  ? t('profile.actions.viewMoreJournal')
                  : t('profile.actions.viewMorePlans')}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </PublicPageShell>
  );
}
