import {
  ChangeEvent,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  deleteTripJournal,
  listMyJournals,
  updateTripJournalVisibility,
} from '@/features/journal/api/journal-api';
import type { JournalVisibility } from '@/features/journal/types/journal';
import { journalQueryKeys } from '@/features/journal/lib/journal-query-keys';
import { ProfileSampleCard } from '@/features/profile/components/profile-sample-card';
import { ProfileSampleJournalEntry } from '@/features/profile/components/profile-sample-journal-entry';
import {
  ProfileShareModal,
  type ProfileShareVisibility,
  type ProfileShareTarget,
} from '@/features/profile/components/profile-share-modal';
import { profilePlaceholderPhotoUrl } from '@/features/profile/content/profile-sample-content';
import {
  buildProfileJournalEntries,
  buildProfileTripEntries,
  formatProfileDate,
  type ProfileGridEntry,
} from '@/features/profile/lib/profile-presenters';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { deleteTrip, listTrips, updateTrip } from '@/features/trips/api/trips-api';
import type { Trip, TripVisibility } from '@/features/trips/types/trip';
import { useAuth } from '@/features/auth/session/use-auth';
import { useI18n } from '@/shared/i18n/use-i18n';
import {
  USER_AVATAR_ACCEPT,
  validateUserAvatarFile,
} from '@/shared/lib/avatar-file-validation';
import { cn } from '@/shared/lib/cn';

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
  const navigate = useNavigate();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('journal');
  const [visibleCount, setVisibleCount] = useState(2);
  const [deletingJournalTripId, setDeletingJournalTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingProfileAvatar, setIsDeletingProfileAvatar] = useState(false);
  const [isSavingShare, setIsSavingShare] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<ProfileFeedback | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState(auth.user?.displayName ?? '');
  const [selectedProfileAvatarFile, setSelectedProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreviewUrl, setProfileAvatarPreviewUrl] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ProfileShareTarget | null>(null);
  const journalsQuery = useQuery({
    queryFn: ({ signal }) => listMyJournals({ signal }),
    queryKey: journalQueryKeys.mine(),
  });
  const tripsQuery = useQuery({
    queryFn: ({ signal }) => listTrips(PROFILE_TRIP_QUERY, { signal }),
    queryKey: ['trips', 'list', 'profile', PROFILE_TRIP_QUERY],
  });
  const shareBadgeLabels = {
    public: t('profile.share.badges.public'),
  };

  const journalEntries = buildProfileJournalEntries(
    journalsQuery.data || [],
    t('profile.actions.updateJournal'),
    shareBadgeLabels,
  );
  const tripEntries = buildProfileTripEntries(
    tripsQuery.data?.data || [],
    t('profile.actions.editPlanner'),
    t('profile.actions.openJournal'),
    shareBadgeLabels,
  );
  const activeEntries = activeTab === 'journal' ? journalEntries : tripEntries;
  const activeQuery = activeTab === 'journal' ? journalsQuery : tripsQuery;
  const visibleEntries = activeEntries.slice(0, visibleCount);
  const publicTripCount = (tripsQuery.data?.data || []).filter(
    (trip) => trip.visibility === 'public',
  ).length;
  const joinedDate = auth.user?.createdAt
    ? formatProfileDate(auth.user.createdAt)
    : t('profile.memberSinceFallback');
  const profileAvatarImage =
    profileAvatarPreviewUrl || auth.user?.avatarUrl || profilePlaceholderPhotoUrl;
  const hasPendingProfileChanges =
    profileDisplayName.trim() !== (auth.user?.displayName ?? '') ||
    selectedProfileAvatarFile !== null;

  useEffect(() => {
    setProfileDisplayName(auth.user?.displayName ?? '');
  }, [auth.user?.displayName]);

  useEffect(() => {
    if (!selectedProfileAvatarFile) {
      setProfileAvatarPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedProfileAvatarFile);
    setProfileAvatarPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedProfileAvatarFile]);

  const handleProfileAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedProfileAvatarFile(null);
      return;
    }

    const avatarError = validateUserAvatarFile(file, t);

    if (avatarError) {
      setProfileFeedback({
        kind: 'error',
        message: avatarError,
      });
      setSelectedProfileAvatarFile(null);
      event.target.value = '';
      return;
    }

    setProfileFeedback(null);
    setSelectedProfileAvatarFile(file);
  };

  const saveProfileChanges = async () => {
    if (!auth.user || isSavingProfile) {
      return;
    }

    const nextDisplayName = profileDisplayName.trim();

    if (nextDisplayName.length < 2) {
      setProfileFeedback({
        kind: 'error',
        message: t('auth.validation.displayNameMin'),
      });
      return;
    }

    if (nextDisplayName.length > 80) {
      setProfileFeedback({
        kind: 'error',
        message: t('auth.validation.displayNameMax'),
      });
      return;
    }

    if (!hasPendingProfileChanges) {
      return;
    }

    setIsSavingProfile(true);
    setProfileFeedback(null);

    try {
      if (nextDisplayName !== (auth.user.displayName ?? '')) {
        await auth.updateProfile({
          displayName: nextDisplayName,
        });
      }

      if (selectedProfileAvatarFile) {
        await auth.uploadAvatar(selectedProfileAvatarFile);
        setSelectedProfileAvatarFile(null);
      }

      setProfileFeedback({
        kind: 'success',
        message: t('profile.edit.saveSuccess'),
      });
    } catch {
      setProfileFeedback({
        kind: 'error',
        message: t('profile.edit.saveError'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const deleteOrClearProfileAvatar = async () => {
    if (selectedProfileAvatarFile) {
      setSelectedProfileAvatarFile(null);
      setProfileFeedback(null);
      return;
    }

    if (!auth.user?.avatarUrl || isDeletingProfileAvatar) {
      return;
    }

    setIsDeletingProfileAvatar(true);
    setProfileFeedback(null);

    try {
      await auth.deleteAvatar();
      setProfileFeedback({
        kind: 'success',
        message: t('profile.edit.deleteAvatarSuccess'),
      });
    } catch {
      setProfileFeedback({
        kind: 'error',
        message: t('profile.edit.deleteAvatarError'),
      });
    } finally {
      setIsDeletingProfileAvatar(false);
    }
  };

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

  const logoutFromProfile = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await auth.logout();
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openShareTarget = (entry: ProfileGridEntry) => {
    const trip = findTripForEntry(entry);
    const journalResult =
      activeTab === 'journal'
        ? journalsQuery.data?.find(({ trip: journalTrip }) => journalTrip.id === entry.id) ?? null
        : null;

    if (!trip) {
      return;
    }

    setProfileFeedback(null);
    setShareTarget({
      image: entry.image,
      kind: activeTab === 'journal' ? 'journal' : 'planner',
      metadata: entry.metadata,
      publicPath:
        activeTab === 'journal'
          ? `/public/trips/${encodeURIComponent(trip.id)}/journal`
          : `/public/trips/${encodeURIComponent(trip.id)}`,
      title: entry.title,
      trip,
      visibility:
        activeTab === 'journal'
          ? journalResult?.journal.visibility ?? 'private'
          : trip.visibility,
    });
  };

  const saveShareVisibility = async (visibility: ProfileShareVisibility) => {
    if (!shareTarget || isSavingShare) {
      return;
    }

    setIsSavingShare(true);
    setProfileFeedback(null);

    try {
      let updatedTrip: Trip;
      let savedVisibility: ProfileShareVisibility;

      if (shareTarget.kind === 'journal') {
        const updatedJournal = await updateTripJournalVisibility(shareTarget.trip.id, {
          visibility: visibility as JournalVisibility,
        });

        updatedTrip = updatedJournal.trip;
        savedVisibility = updatedJournal.journal.visibility;
      } else {
        updatedTrip = await updateTrip(shareTarget.trip.id, {
          visibility: visibility as TripVisibility,
        });
        savedVisibility = updatedTrip.visibility;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trips', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'trips'] }),
        queryClient.invalidateQueries({ queryKey: journalQueryKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: journalQueryKeys.publicList() }),
        queryClient.invalidateQueries({
          queryKey: journalQueryKeys.detail(shareTarget.trip.id),
        }),
        queryClient.invalidateQueries({
          queryKey: journalQueryKeys.publicDetail(shareTarget.trip.id),
        }),
      ]);

      setShareTarget((currentTarget) =>
        currentTarget && currentTarget.trip.id === updatedTrip.id
          ? {
              ...currentTarget,
              trip: updatedTrip,
              visibility: savedVisibility,
            }
          : currentTarget,
      );
      setProfileFeedback({
        kind: 'success',
        message: t('profile.share.saveSuccess', {
          mode: t(`profile.share.modes.${savedVisibility}.title`),
          title: updatedTrip.name,
        }),
      });
    } catch {
      setProfileFeedback({
        kind: 'error',
        message: t('profile.share.saveError', {
          title: shareTarget.trip.name,
        }),
      });
    } finally {
      setIsSavingShare(false);
    }
  };

  const findTripForEntry = (entry: ProfileGridEntry): Trip | null => {
    if (!entry.id) {
      return null;
    }

    if (activeTab === 'journal') {
      return (
        journalsQuery.data?.find(({ trip }) => trip.id === entry.id)?.trip ??
        null
      );
    }

    return tripsQuery.data?.data.find((trip) => trip.id === entry.id) ?? null;
  };

  const deleteProfileJournal = async (entryId: string | undefined, entryTitle: string) => {
    if (!entryId || deletingJournalTripId) {
      return;
    }

    const shouldDelete = window.confirm(t('profile.actions.deleteJournalConfirm', { title: entryTitle }));

    if (!shouldDelete) {
      return;
    }

    setDeletingJournalTripId(entryId);
    setProfileFeedback(null);

    try {
      await deleteTripJournal(entryId);
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.mine() });
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.detail(entryId) });
      setProfileFeedback({
        kind: 'success',
        message: t('profile.actions.deleteJournalSuccess', { title: entryTitle }),
      });
    } catch {
      setProfileFeedback({
        kind: 'error',
        message: t('profile.actions.deleteJournalError', { title: entryTitle }),
      });
    } finally {
      setDeletingJournalTripId(null);
    }
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.profile}
      mainId="profile-content"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 overflow-hidden rounded-[1rem] border border-[#efe2ca] bg-[#fff8ea]/70 p-4 shadow-[0_18px_36px_rgba(76,51,33,0.1)] sm:p-5 lg:flex-row lg:items-stretch">
        <aside className="lg:w-[20rem] lg:flex-none">
          <div className="flex flex-col gap-4">
            <ProfileSampleCard
              badge={t('profile.badge')}
              image={profileAvatarImage}
              name={auth.user?.displayName || t('common.userFallback')}
              stats={[
                {
                  labelLines: [t('profile.stats.journalsLine1'), t('profile.stats.journalsLine2')],
                  value: String(journalsQuery.data?.length || 0),
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

            <form
              className="rounded-[0.85rem] border border-[#e7d6bd] bg-[#fffdfa]/85 p-4 shadow-[0_12px_22px_rgba(76,51,33,0.08)]"
              onSubmit={(event) => {
                event.preventDefault();
                void saveProfileChanges();
              }}
            >
              <label
                className="mb-3 flex flex-col gap-1 font-marker text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#6b4938]"
                htmlFor="profile-display-name"
              >
                {t('profile.edit.displayNameLabel')}
                <input
                  className="rounded-[0.65rem] border border-[#d8c5ab] bg-white/85 px-3 py-2 font-marker text-[1rem] normal-case tracking-normal text-[#251913] outline-none transition focus:border-[#8b6244] focus:ring-2 focus:ring-[#8b6244]/15"
                  id="profile-display-name"
                  maxLength={80}
                  minLength={2}
                  onChange={(event) => setProfileDisplayName(event.target.value)}
                  type="text"
                  value={profileDisplayName}
                />
              </label>

              <div className="mb-3 flex flex-wrap gap-2">
                <label
                  className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-3 py-2 font-marker text-[0.85rem] font-bold leading-none text-[#6b4938] shadow-[0_4px_0_#d7b17a] transition hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[#8b6244]/25"
                  htmlFor="profile-avatar"
                >
                  <Camera className="h-4 w-4" strokeWidth={2.2} />
                  {t('profile.edit.chooseAvatar')}
                  <input
                    accept={USER_AVATAR_ACCEPT}
                    className="sr-only"
                    id="profile-avatar"
                    onChange={handleProfileAvatarChange}
                    type="file"
                  />
                </label>

                <button
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d92d20]/20 bg-[#fff1f0] px-3 py-2 font-marker text-[0.85rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    isDeletingProfileAvatar ||
                    (!selectedProfileAvatarFile && !auth.user?.avatarUrl)
                  }
                  onClick={() => void deleteOrClearProfileAvatar()}
                  type="button"
                >
                  {selectedProfileAvatarFile
                    ? t('profile.edit.clearSelectedAvatar')
                    : isDeletingProfileAvatar
                    ? t('profile.edit.deletingAvatar')
                    : t('profile.edit.deleteAvatar')}
                </button>
              </div>

              <p className="mb-3 font-marker text-[0.78rem] leading-tight text-[#7b6b5c]">
                {selectedProfileAvatarFile?.name || t('profile.edit.avatarHelp')}
              </p>

              <button
                className="w-full rounded-full border border-[#3a5d25]/30 bg-[#b9e177] px-4 py-2 font-marker text-[0.95rem] font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!hasPendingProfileChanges || isSavingProfile}
                type="submit"
              >
                {isSavingProfile
                  ? t('profile.edit.saving')
                  : t('profile.edit.save')}
              </button>
            </form>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#d8c5ab] pb-3">
            <div className="flex flex-wrap gap-3">
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

            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker text-[1rem] font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d7a957]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
              disabled={isLoggingOut}
              onClick={() => void logoutFromProfile()}
              type="button"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.3} />
              {t('common.actions.logout')}
            </button>
          </div>

          {profileFeedback ? (
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
                    ? t('profile.states.journalsEmpty')
                    : t('profile.states.plansEmpty')}
                />
              ) : null}

              {!activeQuery.isLoading && !activeQuery.isError
                ? visibleEntries.map((entry) => (
                    <ProfileSampleJournalEntry
                      actionHref={entry.actionHref}
                      actionLabel={entry.actionLabel}
                      deleteActionLabel={
                        activeTab === 'journal'
                          ? deletingJournalTripId === entry.id
                            ? t('profile.actions.deletingJournal')
                            : t('profile.actions.deleteJournal')
                          : activeTab === 'plans'
                          ? deletingTripId === entry.id
                            ? t('profile.actions.deletingPlanner')
                            : t('profile.actions.deletePlanner')
                          : undefined
                      }
                      image={entry.image}
                      isDeleting={
                        activeTab === 'journal'
                          ? Boolean(deletingJournalTripId)
                          : Boolean(deletingTripId)
                      }
                      key={`${activeTab}-${entry.id ?? entry.title}-${entry.metadata}`}
                      metadata={entry.metadata}
                      onDelete={
                        activeTab === 'journal'
                          ? () => void deleteProfileJournal(entry.id, entry.title)
                          : activeTab === 'plans'
                          ? () => void deleteProfileTrip(entry.id, entry.title)
                          : undefined
                      }
                      rotationClass={entry.rotationClass}
                      secondaryActionHref={entry.secondaryActionHref}
                      secondaryActionLabel={entry.secondaryActionLabel}
                      shareActionLabel={t('profile.actions.share')}
                      shareBadgeLabel={entry.shareBadgeLabel}
                      onShare={() => openShareTarget(entry)}
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
      {shareTarget ? (
        <ProfileShareModal
          isSaving={isSavingShare}
          key={`${shareTarget.kind}-${shareTarget.trip.id}-${shareTarget.visibility}`}
          onClose={() => setShareTarget(null)}
          onSaveVisibility={saveShareVisibility}
          target={shareTarget}
        />
      ) : null}
    </PublicPageShell>
  );
}
