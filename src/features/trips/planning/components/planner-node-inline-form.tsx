import { FormEvent, useMemo, useState } from 'react';

import { ApiError } from '@/shared/api/api-error';
import { useI18n } from '@/shared/i18n/use-i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { StatusBanner } from '@/shared/ui/status-banner';
import { Textarea } from '@/shared/ui/textarea';
import {
  PLAN_NODE_TYPES,
  PlanNode,
  PlannerNodeFormValues,
} from '@/features/trips/planning/types/plan-node';
import { getPlannerNodeFormDefaults } from '@/features/trips/planning/lib/planner-node-form-defaults';

type PlannerNodeInlineFormProps = {
  defaultCurrency: string;
  mode: 'create' | 'edit';
  node?: PlanNode;
  onCancel: () => void;
  onSubmit: (values: PlannerNodeFormValues) => Promise<void>;
  title: string;
};

export function PlannerNodeInlineForm({
  defaultCurrency,
  mode,
  node,
  onCancel,
  onSubmit,
  title,
}: PlannerNodeInlineFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<PlannerNodeFormValues>(() =>
    getPlannerNodeFormDefaults(defaultCurrency, node),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLabel = mode === 'edit'
    ? t('trips.planner.actions.saveNode')
    : t('trips.planner.actions.addNode');

  const typeOptions = useMemo(
    () =>
      PLAN_NODE_TYPES.map((type) => ({
        value: type,
        label: t(`trips.planner.types.${type}`),
      })),
    [t],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (values.title.trim().length === 0) {
      setSubmitError(t('trips.planner.validation.titleRequired'));
      return;
    }

    if (
      values.startAt.trim().length > 0 &&
      values.endAt.trim().length > 0 &&
      values.endAt < values.startAt
    ) {
      setSubmitError(t('trips.planner.validation.dateTimeRangeInvalid'));
      return;
    }

    const hasCostAmount = values.costAmount.trim().length > 0;
    const hasCostCurrency = values.costCurrency.trim().length > 0;

    if (hasCostAmount !== hasCostCurrency) {
      setSubmitError(t('trips.planner.validation.costPairRequired'));
      return;
    }

    if (hasCostAmount && Number(values.costAmount) < 0) {
      setSubmitError(t('trips.planner.validation.costAmountInvalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.message
          ? error.message
          : error instanceof Error && error.message
            ? error.message
            : mode === 'edit'
              ? t('trips.planner.feedback.updateNodeError')
              : t('trips.planner.feedback.createNodeError'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/70 p-5" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
        <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
          {mode === 'edit'
            ? t('trips.planner.editDescription')
            : t('trips.planner.formDescription')}
        </p>
      </div>

      {submitError ? <StatusBanner tone="danger">{submitError}</StatusBanner> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.nodeType')}</span>
          <select
            className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]"
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                type: event.target.value as PlannerNodeFormValues['type'],
              }))
            }
            value={values.type}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.title')}</span>
          <Input
            autoFocus
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                title: event.target.value,
              }))
            }
            placeholder={t('trips.planner.placeholders.title')}
            value={values.title}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.startAt')}</span>
          <Input
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                startAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={values.startAt}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.endAt')}</span>
          <Input
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                endAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={values.endAt}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.costAmount')}</span>
          <Input
            min="0"
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                costAmount: event.target.value,
              }))
            }
            type="number"
            value={values.costAmount}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          <span>{t('trips.planner.fields.costCurrency')}</span>
          <Input
            maxLength={3}
            onChange={(event) =>
              setValues((currentValue) => ({
                ...currentValue,
                costCurrency: event.target.value.toUpperCase(),
              }))
            }
            placeholder={defaultCurrency}
            value={values.costCurrency}
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        <span>{t('trips.planner.fields.notes')}</span>
        <Textarea
          onChange={(event) =>
            setValues((currentValue) => ({
              ...currentValue,
              notes: event.target.value,
            }))
          }
          placeholder={t('trips.planner.placeholders.notes')}
          rows={4}
          value={values.notes}
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        <span>{t('trips.planner.fields.imageUrl')}</span>
        <Input
          onChange={(event) =>
            setValues((currentValue) => ({
              ...currentValue,
              imageUrl: event.target.value,
            }))
          }
          placeholder={t('trips.planner.placeholders.imageUrl')}
          value={values.imageUrl}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? t('trips.planner.actions.savingNode') : submitLabel}
        </Button>
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          {t('trips.actions.cancel')}
        </Button>
      </div>
    </form>
  );
}
