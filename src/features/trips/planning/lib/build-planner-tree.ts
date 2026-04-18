import { PlanNode } from '@/features/trips/planning/types/plan-node';

export type PlannerTreeNode = PlanNode & {
  children: PlannerTreeNode[];
};

export function buildPlannerTree(nodes: PlanNode[]): PlannerTreeNode[] {
  const nodesById = new Map<string, PlannerTreeNode>();
  const roots: PlannerTreeNode[] = [];

  for (const node of nodes) {
    nodesById.set(node.id, {
      ...node,
      children: [],
    });
  }

  for (const node of nodesById.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = nodesById.get(node.parentId);

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children.push(node);
  }

  return sortTreeNodes(roots);
}

function sortTreeNodes(nodes: PlannerTreeNode[]): PlannerTreeNode[] {
  return nodes
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.id.localeCompare(right.id);
    })
    .map((node) => ({
      ...node,
      children: sortTreeNodes(node.children),
    }));
}
