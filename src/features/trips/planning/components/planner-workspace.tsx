import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { buildPlannerTree } from '@/features/trips/planning/lib/build-planner-tree';
import { PlannerNodeInlineForm } from '@/features/trips/planning/components/planner-node-inline-form';
import { PlannerSkeleton } from '@/features/trips/planning/components/planner-skeleton';
import { PlannerTree } from '@/features/trips/planning/components/planner-tree';
import {
  PlanNode,
  PlannerNodeFormValues,
} from '@/features/trips/planning/types/plan-node';
import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { StatusBanner } from '@/shared/ui/status-banner';

type PlannerWorkspaceProps = {
  defaultCurrency: string;
  error: unknown;
  isLoading: boolean;
  nodes: PlanNode[];
  onCreateRoot: (values: PlannerNodeFormValues) => Promise<void>;
  onCreateChild: (
    parent: PlanNode,
    values: PlannerNodeFormValues,
  ) => Promise<void>;
  onDeleteNode: (node: PlanNode) => Promise<void>;
  onRetry: () => Promise<unknown>;
  onUpdateNode: (
    node: PlanNode,
    values: PlannerNodeFormValues,
  ) => Promise<void>;
};

export function PlannerWorkspace({
  defaultCurrency,
  error,
  isLoading,
  nodes,
  onCreateChild,
  onCreateRoot,
  onDeleteNode,
  onRetry,
  onUpdateNode,
}: PlannerWorkspaceProps) {
  const { t } = useI18n();
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const addRootButtonRef = useRef<HTMLButtonElement | null>(null);
  const rootFormTriggerRef = useRef<HTMLElement | null>(null);
  const tree = buildPlannerTree(nodes);

  function restoreRootFocus() {
    window.setTimeout(() => {
      const focusTarget = rootFormTriggerRef.current?.isConnected
        ? rootFormTriggerRef.current
        : addRootButtonRef.current?.isConnected
          ? addRootButtonRef.current
          : null;

      focusTarget?.focus();
    }, 0);
  }

  function openRootForm(trigger: HTMLElement | null) {
    rootFormTriggerRef.current = trigger;
    setIsCreatingRoot(true);
  }

  function closeRootForm() {
    setIsCreatingRoot(false);
    restoreRootFocus();
  }

  return (
    <div aria-busy={isLoading} className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow-text text-[var(--color-forest)]">
            {t('trips.planner.eyebrow')}
          </p>
          <div className="space-y-2">
            <h2 className="headline text-3xl text-[var(--color-ink)]">
              {t('trips.planner.title')}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
              {t('trips.planner.description')}
            </p>
          </div>
        </div>

        <div>
          <Button
            ref={addRootButtonRef}
            onClick={(event) => {
              if (isCreatingRoot) {
                setIsCreatingRoot(false);
                return;
              }

              openRootForm(event.currentTarget);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            {isCreatingRoot
              ? t('trips.planner.actions.hideRootForm')
              : t('trips.planner.actions.addRoot')}
          </Button>
        </div>
      </div>

      {isCreatingRoot ? (
        <PlannerNodeInlineForm
          defaultCurrency={defaultCurrency}
          mode="create"
          onCancel={closeRootForm}
          onSubmit={async (values) => {
            await onCreateRoot(values);
            closeRootForm();
          }}
          title={t('trips.planner.createRootTitle')}
        />
      ) : null}

      {isLoading ? <PlannerSkeleton /> : null}

      {!isLoading && error ? (
        <div className="space-y-4">
          <StatusBanner tone="danger">
            {error instanceof ApiError && error.message
              ? error.message
              : t('trips.planner.feedback.loadError')}
          </StatusBanner>
          <Button onClick={() => void onRetry()} type="button" variant="secondary">
            {t('trips.actions.retry')}
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && tree.length === 0 ? (
        <EmptyState
          action={
            <Button
              onClick={(event) => openRootForm(event.currentTarget)}
              type="button"
            >
              {t('trips.planner.actions.addFirstRoot')}
            </Button>
          }
          description={t('trips.planner.empty')}
          eyebrow={t('trips.planner.eyebrow')}
          title={t('trips.planner.emptyTitle')}
        />
      ) : null}

      {!isLoading && !error && tree.length > 0 ? (
        <PlannerTree
          defaultCurrency={defaultCurrency}
          nodes={tree}
          onCreateChild={(parent, values) => onCreateChild(parent, values)}
          onDeleteNode={(node) => onDeleteNode(node)}
          onUpdateNode={(node, values) => onUpdateNode(node, values)}
        />
      ) : null}
    </div>
  );
}
