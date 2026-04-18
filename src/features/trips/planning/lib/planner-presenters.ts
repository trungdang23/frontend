import {
  PlanNode,
  PlanNodeType,
} from '@/features/trips/planning/types/plan-node';
import { Language } from '@/shared/i18n/language-context';
import { formatTripBudget } from '@/features/trips/lib/trip-presenters';

type Translate = (key: string, values?: Record<string, string | number>) => string;

function getLocale(language: Language) {
  return language === 'vi' ? 'vi-VN' : 'en-US';
}

export function getPlanNodeTypeLabel(type: PlanNodeType, t: Translate) {
  return t(`trips.planner.types.${type}`);
}

export function formatPlanNodeSchedule(
  node: Pick<PlanNode, 'startAt' | 'endAt'>,
  language: Language,
  t: Translate,
) {
  if (!node.startAt && !node.endAt) {
    return t('trips.planner.scheduleEmpty');
  }

  const formatter = new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (node.startAt && node.endAt) {
    return `${formatter.format(new Date(node.startAt))} - ${formatter.format(
      new Date(node.endAt),
    )}`;
  }

  const value = node.startAt ?? node.endAt;

  return formatter.format(new Date(value as string));
}

export function formatPlanNodeCost(
  node: Pick<PlanNode, 'costAmount' | 'costCurrency'>,
  language: Language,
  t: Translate,
) {
  if (node.costAmount === null || node.costCurrency === null) {
    return t('trips.planner.costEmpty');
  }

  return formatTripBudget(node.costAmount, node.costCurrency, language);
}
