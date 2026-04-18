import { PlannerNodeRow } from '@/features/trips/planning/components/planner-node-row';
import { PlannerTreeNode } from '@/features/trips/planning/lib/build-planner-tree';
import { PlannerNodeFormValues } from '@/features/trips/planning/types/plan-node';

type PlannerTreeProps = {
  defaultCurrency: string;
  nodes: PlannerTreeNode[];
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

export function PlannerTree({
  defaultCurrency,
  nodes,
  onCreateChild,
  onDeleteNode,
  onUpdateNode,
}: PlannerTreeProps) {
  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <PlannerNodeRow
          defaultCurrency={defaultCurrency}
          key={node.id}
          node={node}
          onCreateChild={onCreateChild}
          onDeleteNode={onDeleteNode}
          onUpdateNode={onUpdateNode}
        />
      ))}
    </div>
  );
}
