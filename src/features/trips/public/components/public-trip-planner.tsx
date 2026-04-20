import { buildPlannerTree, type PlannerTreeNode } from '@/features/trips/planning/lib/build-planner-tree';
import { PlannerSkeleton } from '@/features/trips/planning/components/planner-skeleton';
import { PlanNode } from '@/features/trips/planning/types/plan-node';
import {
  formatPlanNodeSchedule,
  getPlanNodeTypeLabel,
} from '@/features/trips/planning/lib/planner-presenters';
import { formatTripBudget } from '@/features/trips/lib/trip-presenters';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { StatusBanner } from '@/shared/ui/status-banner';

type PublicTripPlannerProps = {
  defaultCurrency: string;
  error: unknown;
  isLoading: boolean;
  nodes: PlanNode[];
  onRetry: () => Promise<unknown>;
};

export function PublicTripPlanner({
  defaultCurrency,
  error,
  isLoading,
  nodes,
  onRetry,
}: PublicTripPlannerProps) {
  const { t } = useI18n();
  const tree = buildPlannerTree(nodes);

  if (isLoading) {
    return <PlannerSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <StatusBanner tone="danger">
          {error instanceof ApiError && error.message
            ? error.message
            : t('trips.publicPage.plannerLoadError')}
        </StatusBanner>
        <Button onClick={() => void onRetry()} type="button" variant="secondary">
          {t('trips.actions.retry')}
        </Button>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <EmptyState
        description={t('trips.publicPage.plannerEmptyDescription')}
        eyebrow={t('trips.publicPage.plannerEyebrow')}
        title={t('trips.publicPage.plannerEmptyTitle')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <PublicPlannerNodeCard
          defaultCurrency={defaultCurrency}
          key={node.id}
          node={node}
        />
      ))}
    </div>
  );
}

function PublicPlannerNodeCard({
  defaultCurrency,
  node,
}: {
  defaultCurrency: string;
  node: PlannerTreeNode;
}) {
  const { language, t } = useI18n();

  return (
    <div className="space-y-4">
      <Card className="space-y-5 border border-[rgba(84,107,65,0.14)] bg-white/78">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(84,107,65,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-forest)]">
                {getPlanNodeTypeLabel(node.type, t)}
              </span>
              <span className="rounded-full bg-[rgba(138,103,61,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-earth)]">
                {t('trips.publicPage.nodeDepth', { depth: node.depth + 1 })}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                {node.title}
              </h3>
              <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
                {node.notes ?? t('trips.planner.notesEmpty')}
              </p>
            </div>
          </div>

          {node.imageUrl ? (
            <img
              alt={node.title}
              className="h-28 w-full rounded-[1.5rem] object-cover sm:w-48"
              src={node.imageUrl}
            />
          ) : null}
        </div>

        <dl className="grid gap-4 md:grid-cols-2">
          <PlannerMetric
            label={t('trips.fields.dateRange')}
            value={formatPlanNodeSchedule(node, language, t)}
          />
          <PlannerMetric
            label={t('trips.fields.budget')}
            value={
              node.costAmount === null
                ? t('trips.planner.costEmpty')
                : formatTripBudget(
                    node.costAmount,
                    node.costCurrency ?? defaultCurrency,
                    language,
                  )
            }
          />
        </dl>
      </Card>

      {node.children.length > 0 ? (
        <div className="space-y-4 border-l border-[rgba(84,107,65,0.14)] pl-4 sm:pl-6">
          {node.children.map((childNode) => (
            <PublicPlannerNodeCard
              defaultCurrency={defaultCurrency}
              key={childNode.id}
              node={childNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlannerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/80 p-4">
      <p className="eyebrow-text-xs text-[var(--color-forest)]">{label}</p>
      <p className="mt-3 text-sm font-medium leading-7 text-[var(--color-ink)]">
        {value}
      </p>
    </div>
  );
}
