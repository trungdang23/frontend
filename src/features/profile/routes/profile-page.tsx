import {
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { deleteTrip, listTrips } from '@/features/trips/api/trips-api';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';

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
type ProfileFeedback = {
  kind: 'error' | 'success';
  message: string;
};

function ProfileStateCard({ message }: { message: string }) {
  return (
    <article className="rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa]/90 px-5 py-10 text-center shadow-[0_12px_22px_rgba(76,51,33,0.1)] sm:col-span-2">
      <p className="font-marker text-[1rem] leading-tight text-[#6b4938]">{message}</p>
    </article>
  );
}

export function ProfilePage() {
  const auth = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('journal');
  const [visibleCount, setVisibleCount] = useState(2);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [profileFeedback, setProfileFeedback] = useState<ProfileFeedback | null>(null);
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
  const tripEntries = buildProfileTripEntries(
    tripsQuery.data?.data || [],
    t('profile.actions.editPlanner'),
    t('profile.actions.openJournal'),
  );
  const activeEntries = activeTab === 'journal' ? postEntries : tripEntries;
  const activeQuery = activeTab === 'journal' ? postsQuery : tripsQuery;
  const visibleEntries = activeEntries.slice(0, visibleCount);
  const publicTripCount = (tripsQuery.data?.data || []).filter(
    (trip) => trip.visibility === 'public',
  ).length;
  const joinedDate = auth.user?.createdAt
    ? formatProfileDate(auth.user.createdAt)
    : t('profile.memberSinceFallback');

  const deleteProfileTrip = async (entryId: string | undefined, entryTitle: string) => {
    if (!entryId || deletingTripId) {
      return;
    }

    const shouldDelete = window.confirm(t('profile.actions.deletePlannerConfirm', { title: entryTitle }));

    if (!shouldDelete) {
      return;
    }

    setDeletingTripId(entryId);
    setProfileFeedback(null);

    try {
      await deleteTrip(entryId);
      await queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
      setProfileFeedback({
        kind: 'success',
        message: t('profile.actions.deletePlannerSuccess', { title: entryTitle }),
      });
    } catch {
      setProfileFeedback({
        kind: 'error',
        message: t('profile.actions.deletePlannerError', { title: entryTitle }),
      });
    } finally {
      setDeletingTripId(null);
    }
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.profile}
      mainId="profile-content"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[1rem] border border-[#efe2ca] bg-[#fff8ea]/70 p-4 shadow-[0_18px_36px_rgba(76,51,33,0.1)] sm:p-5 lg:flex-row lg:items-stretch">
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

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex shrink-0 flex-wrap gap-3 border-b border-dashed border-[#d8c5ab] pb-3">
            <button
              className={cn(
                'rounded-full border px-4 py-2 font-marker text-[1rem] font-bold leading-none transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                activeTab === 'journal'
                  ? 'border-[#8b6244]/35 bg-[#fff1d9] text-[#6b4938] shadow-[0_5px_0_#d7b17a]'
                  : 'border-[#d8c5ab] bg-white/55 text-[#7b6b5c]',
              )}
              onClick={() => {
                setActiveTab('journal');
                setVisibleCount(2);
              }}
              type="button"
            >
              {t('profile.tabs.journal')}
            </button>
            <button
              className={cn(
                'rounded-full border px-4 py-2 font-marker text-[1rem] font-bold leading-none transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                activeTab === 'plans'
                  ? 'border-[#3a5d25]/40 bg-[#b9e177] text-[#172612] shadow-[0_5px_0_#6f9e44]'
                  : 'border-[#d8c5ab] bg-white/55 text-[#7b6b5c]',
              )}
              onClick={() => {
                setActiveTab('plans');
                setVisibleCount(2);
              }}
              type="button"
            >
              {t('profile.tabs.plans')}
            </button>
          </div>

          {activeTab === 'plans' && profileFeedback ? (
            <p
              className={cn(
                'mb-4 shrink-0 rounded-[0.85rem] border px-4 py-3 font-marker text-[1rem] leading-tight',
                profileFeedback.kind === 'success'
                  ? 'border-[#6f9e44]/35 bg-[#f1ffd8] text-[#31521c]'
                  : 'border-[#d92d20]/25 bg-[#fff1f0] text-[#b42318]',
              )}
              role={profileFeedback.kind === 'success' ? 'status' : 'alert'}
            >
              {profileFeedback.message}
            </p>
          ) : null}

          <div className="shell-scroll-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3">
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
                      actionHref={entry.actionHref}
                      actionLabel={entry.actionLabel}
                      deleteActionLabel={
                        activeTab === 'plans'
                          ? deletingTripId === entry.id
                            ? t('profile.actions.deletingPlanner')
                            : t('profile.actions.deletePlanner')
                          : undefined
                      }
                      image={entry.image}
                      isDeleting={Boolean(deletingTripId)}
                      key={`${activeTab}-${entry.id ?? entry.title}-${entry.metadata}`}
                      metadata={entry.metadata}
                      onDelete={
                        activeTab === 'plans'
                          ? () => void deleteProfileTrip(entry.id, entry.title)
                          : undefined
                      }
                      rotationClass={entry.rotationClass}
                      secondaryActionHref={entry.secondaryActionHref}
                      secondaryActionLabel={entry.secondaryActionLabel}
                      summary={entry.summary}
                      title={entry.title}
                    />
                  ))
                : null}
            </div>

            {visibleEntries.length < activeEntries.length ? (
              <div className="mt-8 flex justify-center">
                <button
                  className="rounded-full border border-[#6b4938]/30 bg-[#8b6244] px-8 py-3 font-marker font-bold leading-none text-white shadow-[0_6px_0_#5a3e28] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
                  onClick={() => setVisibleCount((current) => current + 4)}
                  type="button"
                >
                  {activeTab === 'journal'
                    ? t('profile.actions.viewMoreJournal')
                    : t('profile.actions.viewMorePlans')}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
