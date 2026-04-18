import {
  PlanNode,
  PlannerNodeFormValues,
} from '@/features/trips/planning/types/plan-node';

export function getPlannerNodeFormDefaults(
  _defaultCurrency: string,
  node?: PlanNode,
): PlannerNodeFormValues {
  const fallbackCurrency =
    node?.costAmount !== null &&
    node?.costAmount !== undefined &&
    node.costCurrency !== null
      ? node.costCurrency
      : '';

  return {
    type: node?.type ?? 'activity',
    title: node?.title ?? '',
    notes: node?.notes ?? '',
    startAt: node?.startAt ?? '',
    endAt: node?.endAt ?? '',
    costAmount:
      node?.costAmount === null || node?.costAmount === undefined
        ? ''
        : String(node.costAmount),
    costCurrency: fallbackCurrency,
    imageUrl: node?.imageUrl ?? '',
  };
}
