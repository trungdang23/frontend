import { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PencilLine,
  Plus,
  Trash2,
} from 'lucide-react';

import { TripCoverImage } from '@/features/trips/components/trip-cover-image';
import { PlannerTreeNode } from '@/features/trips/planning/lib/build-planner-tree';
import {
  formatPlanNodeCost,
  formatPlanNodeSchedule,
  getPlanNodeTypeLabel,
} from '@/features/trips/planning/lib/planner-presenters';
import { PlannerNodeInlineForm } from '@/features/trips/planning/components/planner-node-inline-form';
import { PlannerNodeFormValues } from '@/features/trips/planning/types/plan-node';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { StatusBanner } from '@/shared/ui/status-banner';

type PlannerNodeRowProps = {
  defaultCurrency: string;
  node: PlannerTreeNode;
  onCreateChild: (
    parent: PlannerTreeNode,
    values: PlannerNodeFormValues,
  ) => Promise<void>;
  onDeleteNode: (node: PlannerTreeNode) => Promise<void>;
  onUpdateNode: (
    node: PlannerTreeNode,
    values: PlannerNodeFormValues,
  ) => Promise<void>;
};

export function PlannerNodeRow({
  defaultCurrency,
  node,
  onCreateChild,
  onDeleteNode,
  onUpdateNode,
}: PlannerNodeRowProps) {
  const { language, t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const createChildButtonRef = useRef<HTMLButtonElement | null>(null);
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasChildren = node.children.length > 0;
  const childRegionId = `planner-node-children-${node.id}`;

  function restoreActionFocus(target: HTMLButtonElement | null) {
    window.setTimeout(() => {
      if (target?.isConnected) {
        target.focus();
      }
    }, 0);
  }

  function closeChildForm() {
    setIsCreatingChild(false);
    restoreActionFocus(createChildButtonRef.current);
  }

  function closeEditForm() {
    setIsEditing(false);
    restoreActionFocus(editButtonRef.current);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      t('trips.planner.confirmations.deleteNode', { title: node.title }),
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await onDeleteNode(node);
    } catch (error) {
      setDeleteError(
        error instanceof Error && error.message
          ? error.message
          : t('trips.planner.feedback.deleteNodeError'),
      );
    }
  }

  return (
    <div
      className={cn(
        'space-y-4',
        node.depth > 0 &&
          'border-l border-[rgba(84,107,65,0.14)] pl-3 sm:pl-5',
      )}
    >
      <Card className="space-y-4 border border-[var(--color-border)] bg-white/75">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[rgba(84,107,65,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-forest)]">
                {getPlanNodeTypeLabel(node.type, t)}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                {formatPlanNodeSchedule(node, language, t)}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                {formatPlanNodeCost(node, language, t)}
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

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {hasChildren ? (
              <Button
                aria-controls={childRegionId}
                aria-expanded={!isCollapsed}
                onClick={() => setIsCollapsed((currentValue) => !currentValue)}
                type="button"
                variant="secondary"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {isCollapsed
                  ? t('trips.planner.actions.expandChildren')
                  : t('trips.planner.actions.collapseChildren')}
              </Button>
            ) : null}
            <Button
              ref={createChildButtonRef}
              onClick={() => {
                setIsEditing(false);
                setIsCreatingChild((currentValue) => !currentValue);
              }}
              type="button"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              {t('trips.planner.actions.addChild')}
            </Button>
            <Button
              ref={editButtonRef}
              onClick={() => {
                setIsCreatingChild(false);
                setIsEditing((currentValue) => !currentValue);
              }}
              type="button"
              variant="secondary"
            >
              <PencilLine className="h-4 w-4" />
              {t('trips.actions.edit')}
            </Button>
            <Button
              className="border-[rgba(184,71,71,0.24)] text-[var(--color-danger)] hover:border-[var(--color-danger)]"
              onClick={() => void handleDelete()}
              type="button"
              variant="secondary"
            >
              <Trash2 className="h-4 w-4" />
              {t('trips.planner.actions.deleteNode')}
            </Button>
          </div>
        </div>

        {node.imageUrl ? (
          <TripCoverImage
            alt={node.title}
            className="h-56 rounded-[1.5rem]"
            src={node.imageUrl}
          />
        ) : null}

        {deleteError ? <StatusBanner tone="danger">{deleteError}</StatusBanner> : null}
      </Card>

      {isEditing ? (
        <PlannerNodeInlineForm
          defaultCurrency={defaultCurrency}
          mode="edit"
          node={node}
          onCancel={closeEditForm}
          onSubmit={async (values) => {
            await onUpdateNode(node, values);
            closeEditForm();
          }}
          title={t('trips.planner.editNodeTitle')}
        />
      ) : null}

      {isCreatingChild ? (
        <PlannerNodeInlineForm
          defaultCurrency={defaultCurrency}
          mode="create"
          onCancel={closeChildForm}
          onSubmit={async (values) => {
            await onCreateChild(node, values);
            closeChildForm();
            setIsCollapsed(false);
          }}
          title={t('trips.planner.createChildTitle')}
        />
      ) : null}

      {hasChildren && !isCollapsed ? (
        <div className="space-y-4" id={childRegionId}>
          {node.children.map((childNode) => (
            <PlannerNodeRow
              defaultCurrency={defaultCurrency}
              key={childNode.id}
              node={childNode}
              onCreateChild={onCreateChild}
              onDeleteNode={onDeleteNode}
              onUpdateNode={onUpdateNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
