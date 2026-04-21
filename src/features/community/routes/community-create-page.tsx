import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { createPost } from '@/features/community/api/posts-api';
import {
  CommunityPostForm,
  type LinkedTripOption,
} from '@/features/community/components/community-post-form';
import { getCommunityPostFormDefaults } from '@/features/community/lib/community-post-form-defaults';
import { communityQueryKeys } from '@/features/community/lib/community-query-keys';
import type { CommunityPostCreatePayload } from '@/features/community/types/post';
import { listTrips } from '@/features/trips/api/trips-api';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Card } from '@/shared/ui/card';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusBanner } from '@/shared/ui/status-banner';

export function CommunityCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestedTripId = searchParams.get('tripId')?.trim() ?? '';

  const tripsQuery = useQuery({
    queryKey: ['trips', 'list', 'community-create'],
    queryFn: () => listTrips({ page: 0, size: 100, sort: 'startDate,asc' }),
    staleTime: 30_000,
  });

  const allTrips = tripsQuery.data?.data ?? [];
  const publicTrips = allTrips.filter((trip) => trip.visibility === 'public');
  const linkedTripOptions = useMemo<LinkedTripOption[]>(
    () =>
      publicTrips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        coverImageUrl: trip.coverImageUrl,
      })),
    [publicTrips],
  );
  const requestedTrip = requestedTripId
    ? allTrips.find((trip) => trip.id === requestedTripId) ?? null
    : null;
  const resolvedTripId =
    requestedTrip !== null && requestedTrip.visibility === 'public'
      ? requestedTrip.id
      : '';
  const initialValues = useMemo(
    () => getCommunityPostFormDefaults(resolvedTripId),
    [resolvedTripId],
  );

  const tripWarningKey = requestedTripId
    ? requestedTrip === null
      ? 'community.create.tripNotFoundWarning'
      : requestedTrip.visibility !== 'public'
        ? 'community.create.tripNotPublicWarning'
        : null
    : null;

  async function handleCreate(payload: CommunityPostCreatePayload) {
    setSubmitError(null);

    try {
      const post = await createPost(payload);
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.list,
      });
      queryClient.setQueryData(communityQueryKeys.detail(post.id), post);
      navigate(`/community/${post.id}`, {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.message
          ? error.message
          : t('community.feedback.createError'),
      );
    }
  }

  if (tripsQuery.isPending) {
    return <CommunityCreateSkeleton />;
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <p className="eyebrow-text text-[var(--color-forest)]">
          {t('community.createEyebrow')}
        </p>
        <div className="space-y-2">
          <h1 className="headline text-3xl text-[var(--color-ink)] sm:text-4xl">
            {t('community.createTitle')}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t('community.createDescription')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className={getButtonClasses('secondary')} to="/community">
            {t('common.actions.backToCommunity')}
          </Link>
        </div>
      </Card>

      {tripWarningKey ? (
        <StatusBanner tone="danger">{t(tripWarningKey)}</StatusBanner>
      ) : null}

      {tripsQuery.isError ? (
        <StatusBanner tone="danger">
          {tripsQuery.error instanceof ApiError && tripsQuery.error.message
            ? tripsQuery.error.message
            : t('community.create.tripsLoadError')}
        </StatusBanner>
      ) : null}

      <Card>
        <CommunityPostForm
          cancelTo="/community"
          initialValues={initialValues}
          linkedTripOptions={linkedTripOptions}
          onSubmit={handleCreate}
          submitError={submitError}
        />
      </Card>
    </div>
  );
}

function CommunityCreateSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-[2rem]" />
        <Skeleton className="h-7 w-full max-w-3xl rounded-full" />
      </Card>

      <Card className="space-y-6">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-[1.75rem]" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-[1.75rem]" />
      </Card>
    </div>
  );
}
