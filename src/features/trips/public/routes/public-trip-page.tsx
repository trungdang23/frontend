import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Copy,
  Home,
  LogIn,
  MapPin,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  copyPublicTripPlanner,
  getPublicTripPlanner,
} from '@/features/trips/public/api/public-trip-api';
import { publicTripQueryKeys } from '@/features/trips/public/lib/public-trip-query-keys';
import type { PlanNode } from '@/features/trips/planning/types/plan-node';
import { plannerQueryKeys } from '@/features/trips/planning/lib/planner-query-keys';
import type { Trip } from '@/features/trips/types/trip';
import { useAuth } from '@/features/auth/session/use-auth';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';

const fallbackCoverImage = '/images/defaults/planner-hoian.svg';

export function PublicTripPage() {
  const { tripId = '' } = useParams<{ tripId: string }>();
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const plannerQuery = useQuery({
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => getPublicTripPlanner(tripId, { signal }),
    queryKey: publicTripQueryKeys.planner(tripId),
  });
  const copyMutation = useMutation({
    mutationFn: () => copyPublicTripPlanner(tripId),
    onSuccess: (result) => {
      queryClient.setQueryData(plannerQueryKeys.detail(result.trip.id), result);
      void queryClient.invalidateQueries({ queryKey: ['trips', 'list'] });
      navigate(`/app/trips/${encodeURIComponent(result.trip.id)}/planner`);
    },
  });
  const errorStatus =
    plannerQuery.error instanceof ApiError ? plannerQuery.error.status : null;

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.community}
      mainId="public-trip-content"
      scrollable
    >
      {plannerQuery.isLoading ? (
        <PublicTripState
          description={t('trips.publicPage.loadingDescription')}
          title={t('trips.publicPage.loadingTitle')}
        />
      ) : null}

      {plannerQuery.isError ? (
        <PublicTripState
          description={
            errorStatus === 403
              ? t('trips.publicPage.privateDescription')
              : errorStatus === 404
              ? t('trips.publicPage.notFoundDescription')
              : t('trips.publicPage.loadErrorDescription')
          }
          title={
            errorStatus === 403
              ? t('trips.publicPage.privateTitle')
              : errorStatus === 404
              ? t('trips.publicPage.notFoundTitle')
              : t('trips.publicPage.loadErrorTitle')
          }
        />
      ) : null}

      {plannerQuery.data ? (
        <article className="overflow-hidden rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa] shadow-[0_18px_36px_rgba(76,51,33,0.12)]">
          <header className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_28rem]">
            <div className="p-5 sm:p-8">
              <p className="section-label">{t('trips.publicPage.eyebrow')}</p>
              <h1 className="mt-2 font-cursive text-[2.7rem] font-bold leading-none text-[#251b15] sm:text-[3.6rem]">
                {plannerQuery.data.trip.name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 font-marker text-[1rem] leading-tight text-[#5f5146]">
                {plannerQuery.data.trip.destination ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1d9] px-3 py-2">
                    <MapPin className="h-4 w-4" strokeWidth={2.3} />
                    {plannerQuery.data.trip.destination}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8d8] px-3 py-2">
                  <CalendarDays className="h-4 w-4" strokeWidth={2.3} />
                  {formatTripRange(plannerQuery.data.trip.startDate, plannerQuery.data.trip.endDate)}
                </span>
              </div>
              {plannerQuery.data.trip.summaryNotes ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f5146]">
                  {plannerQuery.data.trip.summaryNotes}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {auth.status === 'authenticated' ? (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
                    disabled={copyMutation.isPending}
                    onClick={() => copyMutation.mutate()}
                    type="button"
                  >
                    <Copy className="h-4 w-4" strokeWidth={2.3} />
                    {copyMutation.isPending
                      ? t('trips.publicPage.actions.copyingToAccount')
                      : t('trips.publicPage.actions.copyToAccount')}
                  </button>
                ) : (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
                    state={{ from: location }}
                    to="/auth/login"
                  >
                    <LogIn className="h-4 w-4" strokeWidth={2.3} />
                    {t('trips.publicPage.actions.loginToCopy')}
                  </Link>
                )}
              </div>
              {copyMutation.isError ? (
                <p className="mt-3 max-w-2xl rounded-[0.65rem] border border-[#d92d20]/25 bg-[#fff1f0] px-4 py-3 text-sm leading-6 text-[#b42318]">
                  {t('trips.publicPage.copyError')}
                </p>
              ) : null}
            </div>
            <img
              alt={plannerQuery.data.trip.name}
              className="h-72 w-full object-cover lg:h-full"
              src={plannerQuery.data.trip.coverImageUrl || fallbackCoverImage}
            />
          </header>

          <PublicTripBudgetSection
            nodes={plannerQuery.data.nodes}
            trip={plannerQuery.data.trip}
          />

          <section className="border-t border-[#eadbc5] p-5 sm:p-8">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">{t('trips.publicPage.plannerEyebrow')}</p>
                <h2 className="font-cursive text-[2.2rem] font-bold leading-none text-[#251b15]">
                  {t('trips.publicPage.plannerTitle')}
                </h2>
              </div>
              <p className="font-marker text-[0.95rem] leading-tight text-[#6b4938]">
                {t('trips.publicPage.metrics.plannerDensity')}: {plannerQuery.data.nodes.length}
              </p>
            </div>
            {plannerQuery.data.nodes.length > 0 ? (
              <PublicPlanNodeTree nodes={plannerQuery.data.nodes} />
            ) : (
              <PublicTripState
                compact
                description={t('trips.publicPage.plannerEmptyDescription')}
                title={t('trips.publicPage.plannerEmptyTitle')}
              />
            )}
          </section>
        </article>
      ) : null}
    </PublicPageShell>
  );
}

function PublicTripBudgetSection({
  nodes,
  trip,
}: {
  nodes: PlanNode[];
  trip: Trip;
}) {
  const { t } = useI18n();
  const tripBudget = formatTripBudget(trip);
  const costedNodes = nodes.filter(
    (node) => node.costAmount !== null && node.costCurrency,
  );
  const plannedTotals = summarizeNodeCosts(costedNodes);

  return (
    <section className="border-t border-[#eadbc5] p-5 sm:p-8">
      <div className="mb-5">
        <p className="section-label">{t('trips.publicPage.budget.eyebrow')}</p>
        <h2 className="font-cursive text-[2.2rem] font-bold leading-none text-[#251b15]">
          {t('trips.publicPage.budget.title')}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[0.65rem] border border-[#eadbc5] bg-[#fff8ea]/65 p-4">
          <p className="font-marker text-[0.88rem] font-bold uppercase leading-none tracking-normal text-[#8b6244]">
            {t('trips.publicPage.budget.tripBudgetLabel')}
          </p>
          <p className="mt-2 font-cursive text-[1.55rem] font-bold leading-none text-[#251b15]">
            {tripBudget || t('trips.publicPage.budget.notSet')}
          </p>
        </div>

        <div className="rounded-[0.65rem] border border-[#eadbc5] bg-[#f7fbec] p-4">
          <p className="font-marker text-[0.88rem] font-bold uppercase leading-none tracking-normal text-[#5d7d32]">
            {t('trips.publicPage.budget.plannedLabel')}
          </p>
          <p className="mt-2 font-cursive text-[1.55rem] font-bold leading-none text-[#251b15]">
            {plannedTotals.length > 0
              ? plannedTotals.map((total) => formatMoney(total.amount, total.currency)).join(' / ')
              : t('trips.publicPage.budget.noPlannedCosts')}
          </p>
        </div>
      </div>

      {costedNodes.length > 0 ? (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {costedNodes.map((node) => (
            <li
              className="rounded-[0.55rem] border border-[#eadbc5] bg-white/80 p-4"
              key={node.id}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-marker text-[1rem] font-bold leading-tight text-[#251b15]">
                  {node.title}
                </p>
                <p className="shrink-0 font-marker text-[0.95rem] leading-tight text-[#6b4938]">
                  {formatMoney(node.costAmount ?? 0, node.costCurrency ?? trip.budgetCurrency)}
                </p>
              </div>
              {node.notes ? (
                <p className="mt-2 text-sm leading-6 text-[#5f5146]">{node.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function PublicPlanNodeTree({ nodes }: { nodes: PlanNode[] }) {
  const childrenByParentId = new Map<string | null, PlanNode[]>();

  for (const node of [...nodes].sort(comparePlanNodes)) {
    const siblings = childrenByParentId.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParentId.set(node.parentId, siblings);
  }

  return (
    <div className="space-y-4">
      {(childrenByParentId.get(null) ?? []).map((node) => (
        <PublicPlanNodeBranch
          childrenByParentId={childrenByParentId}
          key={node.id}
          node={node}
        />
      ))}
    </div>
  );
}

function PublicPlanNodeBranch({
  childrenByParentId,
  node,
}: {
  childrenByParentId: Map<string | null, PlanNode[]>;
  node: PlanNode;
}) {
  const children = childrenByParentId.get(node.id) ?? [];

  return (
    <div
      className={cn(
        'rounded-[0.65rem] border border-[#eadbc5] bg-white/80 p-4 shadow-[0_10px_20px_rgba(76,51,33,0.08)]',
        node.depth > 0 ? 'ml-4 border-l-4 border-l-[#b9e177]' : '',
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-marker text-[0.8rem] font-bold uppercase leading-none tracking-normal text-[#8b6244]">
            {node.type}
          </p>
          <h3 className="mt-1 font-cursive text-[1.55rem] font-bold leading-none text-[#251b15]">
            {node.title}
          </h3>
        </div>
        {formatNodeMeta(node) ? (
          <p className="font-marker text-[0.9rem] leading-tight text-[#6b4938]">
            {formatNodeMeta(node)}
          </p>
        ) : null}
      </div>
      {node.notes ? (
        <p className="mt-3 text-sm leading-6 text-[#5f5146]">{node.notes}</p>
      ) : null}
      {node.imageUrl ? (
        <img
          alt={node.title}
          className="mt-3 h-44 w-full rounded-[0.55rem] object-cover"
          src={node.imageUrl}
        />
      ) : null}
      {children.length > 0 ? (
        <div className="mt-4 space-y-3">
          {children.map((childNode) => (
            <PublicPlanNodeBranch
              childrenByParentId={childrenByParentId}
              key={childNode.id}
              node={childNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PublicTripState({
  compact = false,
  description,
  title,
}: {
  compact?: boolean;
  description: string;
  title: string;
}) {
  const { t } = useI18n();

  return (
    <section
      className={cn(
        'rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa] px-5 text-center shadow-[0_14px_28px_rgba(76,51,33,0.1)]',
        compact ? 'py-8' : 'mx-auto max-w-2xl py-14',
      )}
    >
      <h1 className="font-cursive text-[2rem] font-bold leading-none text-[#251b15]">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5f5146]">
        {description}
      </p>
      {!compact ? (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5"
            to="/"
          >
            <Home className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.publicPage.actions.backHome')}
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5"
            to="/auth/login"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.publicPage.actions.login')}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function comparePlanNodes(left: PlanNode, right: PlanNode) {
  return left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);
}

function formatTripRange(startDate: string, endDate: string) {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

function formatShortDate(dateInput: string) {
  const date = new Date(`${dateInput.slice(0, 10)}T00:00:00.000Z`);

  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

function formatNodeMeta(node: PlanNode) {
  const schedule = node.startAt ? formatNodeDateTime(node.startAt) : null;
  const cost =
    node.costAmount !== null && node.costCurrency
      ? formatMoney(node.costAmount, node.costCurrency)
      : null;

  return [schedule, cost].filter(Boolean).join(' • ');
}

function formatTripBudget(trip: Trip) {
  if (trip.budgetMode === 'manual' && trip.manualBudgetAmount !== null && trip.manualBudgetCurrency) {
    return formatMoney(trip.manualBudgetAmount, trip.manualBudgetCurrency);
  }

  if (trip.budgetAmount > 0 && trip.budgetCurrency) {
    return formatMoney(trip.budgetAmount, trip.budgetCurrency);
  }

  return null;
}

function summarizeNodeCosts(nodes: PlanNode[]) {
  const totalsByCurrency = new Map<string, number>();

  for (const node of nodes) {
    if (node.costAmount === null || !node.costCurrency) {
      continue;
    }

    totalsByCurrency.set(
      node.costCurrency,
      (totalsByCurrency.get(node.costCurrency) ?? 0) + node.costAmount,
    );
  }

  return Array.from(totalsByCurrency.entries())
    .map(([currency, amount]) => ({
      amount,
      currency,
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString('vi-VN')} ${currency}`;
}

function formatNodeDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
