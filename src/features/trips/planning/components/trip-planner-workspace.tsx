import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildJournalTripPath } from '@/app/router/trip-route-redirects';
import { ApiError } from '@/shared/api/api-error';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/use-i18n';
import { PublicPageShell } from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';
import {
  createPlanNode,
  deletePlanNode,
  getTripPlanner,
  updatePlanNode,
} from '@/features/trips/planning/api/planner-api';
import { plannerQueryKeys } from '@/features/trips/planning/lib/planner-query-keys';
import {
  PLAN_NODE_TYPES,
  type PlanNode,
  type PlannerNodeFormValues,
  type PlanNodeMutationPayload,
  type PlanNodeType,
  type PlanNodeUpdatePayload,
} from '@/features/trips/planning/types/plan-node';
import type { Trip } from '@/features/trips/types/trip';

type TripPlannerWorkspaceProps = {
  tripId: string;
};

type PlannerNodeFormErrors = Partial<Record<keyof PlannerNodeFormValues, string>>;

type PlannerNodeFormTarget =
  | {
      kind: 'create-root';
    }
  | {
      kind: 'create-child';
      parentId: string;
    }
  | {
      kind: 'edit';
      nodeId: string;
    };

type PlannerWorkspaceFeedback = {
  kind: 'error' | 'success';
  message: string;
};

const DEFAULT_NODE_FORM_VALUES: PlannerNodeFormValues = {
  costAmount: '',
  costCurrency: '',
  endAt: '',
  imageUrl: '',
  notes: '',
  startAt: '',
  title: '',
  type: 'section',
};

export function TripPlannerWorkspace({ tripId }: TripPlannerWorkspaceProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<PlannerNodeFormTarget | null>(null);
  const [formValues, setFormValues] = useState<PlannerNodeFormValues>(DEFAULT_NODE_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<PlannerNodeFormErrors>({});
  const [isSavingNode, setIsSavingNode] = useState(false);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PlannerWorkspaceFeedback | null>(null);
  const plannerQuery = useQuery({
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => getTripPlanner(tripId, { signal }),
    queryKey: plannerQueryKeys.detail(tripId),
  });
  const trip = plannerQuery.data?.trip ?? null;
  const nodes = [...(plannerQuery.data?.nodes ?? [])].sort(comparePlanNodes);
  const childrenByParentId = buildChildrenByParentId(nodes);
  const rootNodes = childrenByParentId.get(null) ?? [];

  useEffect(() => {
    if (!activeForm) {
      return;
    }

    if (activeForm.kind === 'edit' && !nodes.some((node) => node.id === activeForm.nodeId)) {
      setActiveForm(null);
      setFormErrors({});
      setIsSavingNode(false);
    }

    if (activeForm.kind === 'create-child' && !nodes.some((node) => node.id === activeForm.parentId)) {
      setActiveForm(null);
      setFormErrors({});
      setIsSavingNode(false);
    }
  }, [activeForm, nodes]);

  const openRootNodeForm = () => {
    setActiveForm({ kind: 'create-root' });
    setFormValues(createNodeFormValues('section'));
    setFormErrors({});
    setFeedback(null);
  };

  const openChildNodeForm = (parentNode: PlanNode) => {
    setActiveForm({
      kind: 'create-child',
      parentId: parentNode.id,
    });
    setFormValues(createNodeFormValues(resolveDefaultChildNodeType(parentNode.type)));
    setFormErrors({});
    setFeedback(null);
  };

  const openEditNodeForm = (node: PlanNode) => {
    setActiveForm({
      kind: 'edit',
      nodeId: node.id,
    });
    setFormValues(buildNodeFormValuesFromNode(node));
    setFormErrors({});
    setFeedback(null);
  };

  const closeNodeForm = () => {
    setActiveForm(null);
    setFormValues(DEFAULT_NODE_FORM_VALUES);
    setFormErrors({});
  };

  const updateNodeField = <Field extends keyof PlannerNodeFormValues>(
    field: Field,
    value: PlannerNodeFormValues[Field],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      delete nextErrors[field];

      if (field === 'startAt' || field === 'endAt') {
        delete nextErrors.startAt;
        delete nextErrors.endAt;
      }

      if (field === 'costAmount' || field === 'costCurrency') {
        delete nextErrors.costAmount;
        delete nextErrors.costCurrency;
      }

      return nextErrors;
    });
    setFeedback(null);
  };

  const submitNodeForm = async () => {
    if (!trip || !activeForm || isSavingNode) {
      return;
    }

    const nextErrors = validateNodeFormValues(formValues, t);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSavingNode(true);
    setFeedback(null);

    try {
      if (activeForm.kind === 'edit') {
        const updatedNode = await updatePlanNode(
          activeForm.nodeId,
          buildPlanNodeUpdatePayload(formValues),
        );

        queryClient.setQueryData(
          plannerQueryKeys.detail(tripId),
          updatePlannerNodeInQueryData(updatedNode),
        );
      } else {
        const siblingNodes =
          activeForm.kind === 'create-root'
            ? rootNodes
            : childrenByParentId.get(activeForm.parentId) ?? [];
        const createdNode = await createPlanNode({
          ...buildPlanNodeMutationPayload(formValues),
          parentId: activeForm.kind === 'create-root' ? null : activeForm.parentId,
          sortOrder: getNextNodeSortOrder(siblingNodes),
          tripId,
        });

        queryClient.setQueryData(
          plannerQueryKeys.detail(tripId),
          appendPlannerNodeToQueryData(createdNode),
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: plannerQueryKeys.detail(tripId) }),
      ]);
      closeNodeForm();
      setFeedback({
        kind: 'success',
        message: activeForm.kind === 'edit'
          ? t('trips.planner.actions.saveNode')
          : t('trips.planner.actions.addNode'),
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: resolveNodeMutationErrorMessage(
          error,
          t(
            activeForm.kind === 'edit'
              ? 'trips.planner.feedback.updateNodeError'
              : 'trips.planner.feedback.createNodeError',
          ),
        ),
      });
    } finally {
      setIsSavingNode(false);
    }
  };

  const removeNode = async (node: PlanNode) => {
    if (deletingNodeId || isSavingNode) {
      return;
    }

    const shouldDelete = window.confirm(
      t('trips.planner.confirmations.deleteNode', { title: node.title }),
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingNodeId(node.id);
    setFeedback(null);

    try {
      await deletePlanNode(node.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: plannerQueryKeys.detail(tripId) }),
      ]);
      setFeedback({
        kind: 'success',
        message: t('trips.planner.actions.deleteNode'),
      });
      if (activeForm?.kind === 'edit' && activeForm.nodeId === node.id) {
        closeNodeForm();
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: resolveNodeMutationErrorMessage(error, t('trips.planner.feedback.deleteNodeError')),
      });
    } finally {
      setDeletingNodeId(null);
    }
  };

  return (
    <PublicPageShell
      mainClassName={publicPageMainLayouts.community}
      mainId="planner-workspace-content"
      scrollable
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-5 lg:py-7">
        {plannerQuery.isLoading ? (
          <PlannerWorkspaceState
            description={t('trips.publicPage.loadingDescription')}
            title={t('trips.planner.title')}
          />
        ) : null}

        {plannerQuery.isError ? (
          <PlannerWorkspaceState
            action={(
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d7a957]/30"
                onClick={() => void plannerQuery.refetch()}
                type="button"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2.3} />
                {t('trips.actions.retry')}
              </button>
            )}
            description={resolvePlannerLoadErrorDescription(plannerQuery.error, t)}
            title={resolvePlannerLoadErrorTitle(plannerQuery.error, t)}
          />
        ) : null}

        {trip ? (
          <>
            <PlannerWorkspaceHero
              onAddRoot={openRootNodeForm}
              trip={trip}
            />

            {feedback ? (
              <p
                className={cn(
                  'rounded-[0.9rem] border px-4 py-3 font-marker text-[1rem] leading-tight shadow-[0_10px_18px_rgba(76,51,33,0.08)]',
                  feedback.kind === 'success'
                    ? 'border-[#6f9e44]/35 bg-[#f1ffd8] text-[#31521c]'
                    : 'border-[#d92d20]/25 bg-[#fff1f0] text-[#b42318]',
                )}
                role={feedback.kind === 'success' ? 'status' : 'alert'}
              >
                {feedback.message}
              </p>
            ) : null}

            {activeForm?.kind === 'create-root' ? (
              <PlannerNodeFormCard
                errors={formErrors}
                isSavingNode={isSavingNode}
                onCancel={closeNodeForm}
                onChange={updateNodeField}
                onSubmit={() => void submitNodeForm()}
                submitLabel={t('trips.planner.actions.addNode')}
                submittingLabel={t('trips.planner.actions.savingNode')}
                title={t('trips.planner.createRootTitle')}
                values={formValues}
              />
            ) : null}

            {rootNodes.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-end">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
                    onClick={openRootNodeForm}
                    type="button"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.3} />
                    {t('trips.planner.actions.addRoot')}
                  </button>
                </div>

                <div className="space-y-4">
                  {rootNodes.map((node) => (
                    <PlannerNodeBranch
                      activeEditNodeId={activeForm?.kind === 'edit' ? activeForm.nodeId : null}
                      activeForm={activeForm}
                      childrenByParentId={childrenByParentId}
                      deletingNodeId={deletingNodeId}
                      formErrors={formErrors}
                      formValues={formValues}
                      isSavingNode={isSavingNode}
                      key={node.id}
                      node={node}
                      onAddChild={openChildNodeForm}
                      onCancelForm={closeNodeForm}
                      onChangeFormField={updateNodeField}
                      onDelete={removeNode}
                      onEdit={openEditNodeForm}
                      onSubmitForm={() => void submitNodeForm()}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {rootNodes.length === 0 && activeForm?.kind !== 'create-root' ? (
              <PlannerWorkspaceState
                action={(
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
                    onClick={openRootNodeForm}
                    type="button"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.3} />
                    {t('trips.planner.actions.addFirstRoot')}
                  </button>
                )}
                description={t('trips.planner.empty')}
                title={t('trips.planner.emptyTitle')}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </PublicPageShell>
  );
}

function PlannerWorkspaceHero({
  onAddRoot,
  trip,
}: {
  onAddRoot: () => void;
  trip: Trip;
}) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-[1.2rem] border border-[#eadbc5] bg-[linear-gradient(135deg,rgba(255,252,244,0.98),rgba(246,234,210,0.96))] px-5 py-6 shadow-[0_20px_40px_rgba(76,51,33,0.12)] sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#9f7d58_0.9px,transparent_0.9px)] [background-size:20px_20px]" />
      <div className="pointer-events-none absolute -right-10 top-2 h-16 w-40 rotate-[10deg] bg-[#f6d78d]/60 shadow-[0_12px_18px_rgba(93,67,40,0.12)]" />
      <div className="pointer-events-none absolute -left-5 bottom-5 h-12 w-28 -rotate-[8deg] bg-[#a8dfd5]/70 shadow-[0_10px_16px_rgba(72,109,98,0.12)]" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-5">
          {trip.coverImageUrl ? (
            <img
              alt={trip.name}
              className="h-28 w-28 shrink-0 rounded-[1rem] object-cover shadow-[0_10px_20px_rgba(76,51,33,0.15)]"
              src={trip.coverImageUrl}
            />
          ) : null}
          <div className="max-w-3xl space-y-3">
            <h1 className="font-display text-[2.45rem] leading-tight text-[#2c1f18] sm:text-[3.4rem]">
              {trip.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
            {trip.destination ? (
              <PlannerHeroPill icon={<MapPin className="h-4 w-4" strokeWidth={2.3} />}>
                {trip.destination}
              </PlannerHeroPill>
            ) : null}
            <PlannerHeroPill icon={<CalendarDays className="h-4 w-4" strokeWidth={2.3} />}>
              {formatTripRange(trip.startDate, trip.endDate)}
            </PlannerHeroPill>
            <PlannerHeroPill icon={<BookOpenText className="h-4 w-4" strokeWidth={2.3} />}>
              {t(`trips.visibility.${trip.visibility}`)}
            </PlannerHeroPill>
          </div>
        </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-4 py-2 font-marker font-bold leading-none text-[#6b4938] shadow-[0_5px_0_rgba(139,98,68,0.18)] transition hover:-translate-y-0.5"
            to={`/app/trips/${encodeURIComponent(trip.id)}/edit`}
          >
            <Pencil className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.actions.edit')}
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[#bc956f]/30 bg-[#fff8ea] px-4 py-2 font-marker font-bold leading-none text-[#6b4938] shadow-[0_5px_0_rgba(188,149,111,0.18)] transition hover:-translate-y-0.5"
            to={buildJournalTripPath(trip.id)}
          >
            <BookOpenText className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.actions.openJournal')}
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
            onClick={onAddRoot}
            type="button"
          >
            <Plus className="h-4 w-4" strokeWidth={2.3} />
            {t('trips.planner.actions.addRoot')}
          </button>
        </div>
      </div>
    </section>
  );
}

function PlannerHeroPill({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff8ea] px-3 py-1.5 font-marker text-[0.96rem] leading-none text-[#6b4938] shadow-[0_4px_10px_rgba(69,48,34,0.08)]">
      {icon}
      {children}
    </span>
  );
}

function PlannerNodeBranch({
  activeEditNodeId,
  activeForm,
  childrenByParentId,
  deletingNodeId,
  formErrors,
  formValues,
  isSavingNode,
  node,
  onAddChild,
  onCancelForm,
  onChangeFormField,
  onDelete,
  onEdit,
  onSubmitForm,
}: {
  activeEditNodeId: string | null;
  activeForm: PlannerNodeFormTarget | null;
  childrenByParentId: Map<string | null, PlanNode[]>;
  deletingNodeId: string | null;
  formErrors: PlannerNodeFormErrors;
  formValues: PlannerNodeFormValues;
  isSavingNode: boolean;
  node: PlanNode;
  onAddChild: (node: PlanNode) => void;
  onCancelForm: () => void;
  onChangeFormField: <Field extends keyof PlannerNodeFormValues>(
    field: Field,
    value: PlannerNodeFormValues[Field],
  ) => void;
  onDelete: (node: PlanNode) => Promise<void>;
  onEdit: (node: PlanNode) => void;
  onSubmitForm: () => void;
}) {
  const { t } = useI18n();
  const children = childrenByParentId.get(node.id) ?? [];
  const isCreateChildFormOpen = activeForm?.kind === 'create-child' && activeForm.parentId === node.id;
  const isEditFormOpen = activeForm?.kind === 'edit' && activeEditNodeId === node.id;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] shadow-[0_18px_34px_rgba(76,51,33,0.1)]',
        node.depth > 0 ? 'ml-4 sm:ml-6' : '',
      )}
    >
      <div className="border-b border-[#f0e3d1] bg-[linear-gradient(135deg,rgba(255,252,244,0.96),rgba(248,238,216,0.92))] px-5 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#fff1d9] px-3 py-1 font-marker text-[0.84rem] font-bold uppercase leading-none text-[#8b6244]">
                {t(`trips.planner.types.${node.type}`)}
              </span>
              <span className="rounded-full bg-[#eff9ff] px-3 py-1 font-marker text-[0.84rem] font-bold leading-none text-[#24546d]">
                {t('trips.publicPage.nodeDepth', { depth: node.depth })}
              </span>
            </div>
            <h3 className="font-display text-[1.85rem] leading-tight text-[#2c1f18] sm:text-[2.2rem]">
              {node.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {formatNodeSchedule(node) ? (
                <PlannerHeroPill icon={<CalendarDays className="h-4 w-4" strokeWidth={2.3} />}>
                  {formatNodeSchedule(node)}
                </PlannerHeroPill>
              ) : null}
              {formatNodeCost(node) ? (
                <PlannerHeroPill icon={<ArrowRight className="h-4 w-4" strokeWidth={2.3} />}>
                  {formatNodeCost(node)}
                </PlannerHeroPill>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#3a5d25]/35 bg-[#eef8d8] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#31521c] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/25"
              onClick={() => onAddChild(node)}
              type="button"
            >
              <Plus className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.planner.actions.addChild')}
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#8b6244]/30 bg-[#fff1d9] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
              onClick={() => onEdit(node)}
              type="button"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.3} />
              {t('trips.actions.edit')}
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d92d20]/25 bg-[#fff1f0] px-3 py-2 font-marker text-[0.92rem] font-bold leading-none text-[#b42318] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d92d20]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
              disabled={Boolean(deletingNodeId)}
              onClick={() => void onDelete(node)}
              type="button"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.3} />
              {deletingNodeId === node.id ? t('trips.actions.deleting') : t('trips.planner.actions.deleteNode')}
            </button>
          </div>
        </div>

        {node.notes ? (
          <p className="mt-4 text-sm leading-7 text-[#5f5146]">
            {node.notes}
          </p>
        ) : null}

        {node.imageUrl ? (
          <img
            alt={node.title}
            className="mt-4 h-52 w-full rounded-[0.9rem] object-cover"
            src={node.imageUrl}
          />
        ) : null}
      </div>

      {isEditFormOpen ? (
        <div className="px-5 py-5">
          <PlannerNodeFormCard
            errors={formErrors}
            isSavingNode={isSavingNode}
            onCancel={onCancelForm}
            onChange={onChangeFormField}
            onSubmit={onSubmitForm}
            submitLabel={t('trips.planner.actions.saveNode')}
            submittingLabel={t('trips.planner.actions.savingNode')}
            title={t('trips.planner.editNodeTitle')}
            values={formValues}
          />
        </div>
      ) : null}

      {isCreateChildFormOpen ? (
        <div className="border-t border-[#f0e3d1] px-5 py-5">
          <PlannerNodeFormCard
            errors={formErrors}
            isSavingNode={isSavingNode}
            onCancel={onCancelForm}
            onChange={onChangeFormField}
            onSubmit={onSubmitForm}
            submitLabel={t('trips.planner.actions.addNode')}
            submittingLabel={t('trips.planner.actions.savingNode')}
            title={t('trips.planner.createChildTitle')}
            values={formValues}
          />
        </div>
      ) : null}

      {children.length > 0 ? (
        <div className="space-y-4 border-t border-[#f0e3d1] bg-[#fffcf7] px-4 py-4 sm:px-5">
          {children.map((childNode) => (
            <PlannerNodeBranch
              activeEditNodeId={activeEditNodeId}
              activeForm={activeForm}
              childrenByParentId={childrenByParentId}
              deletingNodeId={deletingNodeId}
              formErrors={formErrors}
              formValues={formValues}
              isSavingNode={isSavingNode}
              key={childNode.id}
              node={childNode}
              onAddChild={onAddChild}
              onCancelForm={onCancelForm}
              onChangeFormField={onChangeFormField}
              onDelete={onDelete}
              onEdit={onEdit}
              onSubmitForm={onSubmitForm}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function PlannerNodeFormCard({
  errors,
  isSavingNode,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  title,
  values,
}: {
  errors: PlannerNodeFormErrors;
  isSavingNode: boolean;
  onCancel: () => void;
  onChange: <Field extends keyof PlannerNodeFormValues>(
    field: Field,
    value: PlannerNodeFormValues[Field],
  ) => void;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  values: PlannerNodeFormValues;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-[1rem] border border-[#eadbc5] bg-[#fff8ea] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-display text-[1.55rem] leading-tight text-[#2c1f18]">
            {title}
          </h4>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5f5146]">
            {t('trips.planner.fields.nodeType')}
          </span>
          <select
            className="w-full rounded-[0.8rem] border border-[#d9cbb6] bg-white px-3 py-3 text-sm text-[#2c1f18] outline-none focus:border-[#8b6244] focus:ring-2 focus:ring-[#8b6244]/15"
            onChange={(event) => onChange('type', event.target.value as PlanNodeType)}
            value={values.type}
          >
            {PLAN_NODE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`trips.planner.types.${type}`)}
              </option>
            ))}
          </select>
        </label>

        <PlannerNodeField
          error={errors.title}
          label={t('trips.planner.fields.title')}
        >
          <input
            className={inputClassName(Boolean(errors.title))}
            onChange={(event) => onChange('title', event.target.value)}
            type="text"
            value={values.title}
          />
        </PlannerNodeField>

        <PlannerNodeField
          error={errors.startAt}
          label={t('trips.planner.fields.startAt')}
        >
          <input
            className={inputClassName(Boolean(errors.startAt))}
            onChange={(event) => onChange('startAt', event.target.value)}
            type="datetime-local"
            value={values.startAt}
          />
        </PlannerNodeField>

        <PlannerNodeField
          error={errors.endAt}
          label={t('trips.planner.fields.endAt')}
        >
          <input
            className={inputClassName(Boolean(errors.endAt))}
            onChange={(event) => onChange('endAt', event.target.value)}
            type="datetime-local"
            value={values.endAt}
          />
        </PlannerNodeField>

        <PlannerNodeField
          error={errors.costAmount}
          label={t('trips.planner.fields.costAmount')}
        >
          <input
            className={inputClassName(Boolean(errors.costAmount))}
            inputMode="numeric"
            onChange={(event) => onChange('costAmount', event.target.value.replace(/[^\d]/g, ''))}
            type="text"
            value={values.costAmount}
          />
        </PlannerNodeField>

        <PlannerNodeField
          error={errors.costCurrency}
          label={t('trips.planner.fields.costCurrency')}
        >
          <input
            className={inputClassName(Boolean(errors.costCurrency))}
            maxLength={3}
            onChange={(event) => onChange('costCurrency', event.target.value.toUpperCase())}
            type="text"
            value={values.costCurrency}
          />
        </PlannerNodeField>

        <PlannerNodeField
          className="lg:col-span-2"
          error={errors.imageUrl}
          label={t('trips.planner.fields.imageUrl')}
        >
          <input
            className={inputClassName(Boolean(errors.imageUrl))}
            onChange={(event) => onChange('imageUrl', event.target.value)}
            type="url"
            value={values.imageUrl}
          />
        </PlannerNodeField>

        <PlannerNodeField
          className="lg:col-span-2"
          error={errors.notes}
          label={t('trips.planner.fields.notes')}
        >
          <textarea
            className={cn(inputClassName(Boolean(errors.notes)), 'min-h-32 resize-y')}
            onChange={(event) => onChange('notes', event.target.value)}
            value={values.notes}
          />
        </PlannerNodeField>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[#8b6244]/25 bg-white px-4 py-2 font-marker font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/20"
          onClick={onCancel}
          type="button"
        >
          {t('trips.actions.cancel')}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[#3a5d25]/40 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
          disabled={isSavingNode}
          onClick={onSubmit}
          type="button"
        >
          {isSavingNode ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

function PlannerNodeField({
  children,
  className,
  error,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  label: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-[#5f5146]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-sm leading-6 text-[#b42318]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function PlannerWorkspaceState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[1rem] border border-[#eadbc5] bg-[#fffdfa] px-5 py-12 text-center shadow-[0_14px_28px_rgba(76,51,33,0.1)] sm:px-8">
      <h2 className="font-display text-[2rem] leading-tight text-[#2c1f18] sm:text-[2.5rem]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5f5146] sm:text-base">
        {description}
      </p>
      {action ? (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      ) : null}
    </section>
  );
}

function buildChildrenByParentId(nodes: PlanNode[]) {
  const childrenByParentId = new Map<string | null, PlanNode[]>();

  for (const node of nodes) {
    const siblings = childrenByParentId.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParentId.set(node.parentId, siblings);
  }

  return childrenByParentId;
}

function createNodeFormValues(type: PlanNodeType): PlannerNodeFormValues {
  return {
    ...DEFAULT_NODE_FORM_VALUES,
    type,
  };
}

function buildNodeFormValuesFromNode(node: PlanNode): PlannerNodeFormValues {
  return {
    costAmount: node.costAmount === null ? '' : String(node.costAmount),
    costCurrency: node.costCurrency ?? '',
    endAt: toDateTimeLocalValue(node.endAt),
    imageUrl: node.imageUrl ?? '',
    notes: node.notes ?? '',
    startAt: toDateTimeLocalValue(node.startAt),
    title: node.title,
    type: node.type,
  };
}

function validateNodeFormValues(
  values: PlannerNodeFormValues,
  t: (key: string, values?: Record<string, number | string>) => string,
) {
  const nextErrors: PlannerNodeFormErrors = {};
  const title = values.title.trim();
  const startAt = values.startAt.trim();
  const endAt = values.endAt.trim();
  const costAmount = values.costAmount.trim();
  const costCurrency = values.costCurrency.trim();
  const imageUrl = values.imageUrl.trim();

  if (!title) {
    nextErrors.title = t('trips.planner.validation.titleRequired');
  }

  if (startAt && endAt && endAt < startAt) {
    nextErrors.endAt = t('trips.planner.validation.dateTimeRangeInvalid');
  }

  if ((costAmount && !costCurrency) || (!costAmount && costCurrency)) {
    nextErrors.costAmount = t('trips.planner.validation.costPairRequired');
    nextErrors.costCurrency = t('trips.planner.validation.costPairRequired');
  }

  if (costAmount && Number(costAmount) < 0) {
    nextErrors.costAmount = t('trips.planner.validation.costAmountInvalid');
  }

  if (imageUrl && !isValidHttpUrl(imageUrl)) {
    nextErrors.imageUrl = t('trips.validation.coverImageUrlInvalid');
  }

  return nextErrors;
}

function buildPlanNodeMutationPayload(values: PlannerNodeFormValues): Omit<PlanNodeMutationPayload, 'parentId' | 'sortOrder' | 'tripId'> {
  const costAmount = values.costAmount.trim() ? Number(values.costAmount.trim()) : null;

  return {
    costAmount,
    costCurrency: costAmount === null ? null : values.costCurrency.trim().toUpperCase(),
    endAt: toNullableTrimmedValue(values.endAt),
    imageUrl: toNullableTrimmedValue(values.imageUrl),
    notes: toNullableTrimmedValue(values.notes),
    startAt: toNullableTrimmedValue(values.startAt),
    title: values.title.trim(),
    type: values.type,
  };
}

function buildPlanNodeUpdatePayload(values: PlannerNodeFormValues): PlanNodeUpdatePayload {
  const costAmount = values.costAmount.trim() ? Number(values.costAmount.trim()) : null;

  return {
    costAmount,
    costCurrency: costAmount === null ? null : values.costCurrency.trim().toUpperCase(),
    endAt: toNullableTrimmedValue(values.endAt),
    imageUrl: toNullableTrimmedValue(values.imageUrl),
    notes: toNullableTrimmedValue(values.notes),
    startAt: toNullableTrimmedValue(values.startAt),
    title: values.title.trim(),
    type: values.type,
  };
}

function updatePlannerNodeInQueryData(updatedNode: PlanNode) {
  return (currentPlanner: { trip: Trip; nodes: PlanNode[] } | undefined) => {
    if (!currentPlanner) {
      return currentPlanner;
    }

    return {
      ...currentPlanner,
      nodes: currentPlanner.nodes.map((node) => (
        node.id === updatedNode.id ? updatedNode : node
      )),
    };
  };
}

function appendPlannerNodeToQueryData(createdNode: PlanNode) {
  return (currentPlanner: { trip: Trip; nodes: PlanNode[] } | undefined) => {
    if (!currentPlanner) {
      return currentPlanner;
    }

    return {
      ...currentPlanner,
      nodes: [...currentPlanner.nodes, createdNode],
    };
  };
}

function getNextNodeSortOrder(nodes: PlanNode[]) {
  if (nodes.length === 0) {
    return 0;
  }

  return Math.max(...nodes.map((node) => node.sortOrder)) + 1;
}

function resolveDefaultChildNodeType(parentType: PlanNodeType): PlanNodeType {
  switch (parentType) {
    case 'section':
      return 'day';
    case 'day':
      return 'activity';
    case 'location':
      return 'activity';
    default:
      return 'note';
  }
}

function resolveNodeMutationErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function resolvePlannerLoadErrorTitle(
  error: unknown,
  t: (key: string, values?: Record<string, number | string>) => string,
) {
  return error instanceof ApiError && error.status === 404
    ? t('trips.notFoundTitle')
    : t('trips.loadErrorTitle');
}

function resolvePlannerLoadErrorDescription(
  error: unknown,
  t: (key: string, values?: Record<string, number | string>) => string,
) {
  return error instanceof ApiError && error.status === 404
    ? t('trips.notFoundDescription')
    : t('trips.planner.feedback.loadError');
}

function comparePlanNodes(left: PlanNode, right: PlanNode) {
  return left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);
}

function inputClassName(hasError: boolean) {
  return cn(
    'w-full rounded-[0.8rem] border bg-white px-3 py-3 text-sm text-[#2c1f18] outline-none focus:ring-2 focus:ring-[#8b6244]/15',
    hasError ? 'border-[#d92d20] focus:border-[#d92d20]' : 'border-[#d9cbb6] focus:border-[#8b6244]',
  );
}

function formatTripRange(startDate: string, endDate: string) {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

function formatShortDate(dateInput: string) {
  const date = new Date(`${dateInput.slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString('vi-VN')} ${currency}`;
}

function formatNodeSchedule(node: PlanNode) {
  if (!node.startAt && !node.endAt) {
    return '';
  }

  if (!node.startAt) {
    return formatNodeDateTime(node.endAt);
  }

  if (!node.endAt) {
    return formatNodeDateTime(node.startAt);
  }

  const startDate = node.startAt.slice(0, 10);
  const endDate = node.endAt.slice(0, 10);

  if (startDate === endDate) {
    return `${formatShortDate(startDate)} · ${node.startAt.slice(11, 16)} - ${node.endAt.slice(11, 16)}`;
  }

  return `${formatNodeDateTime(node.startAt)} - ${formatNodeDateTime(node.endAt)}`;
}

function formatNodeDateTime(value: string | null) {
  if (!value) {
    return '';
  }

  const [date, time = ''] = value.split('T');

  return `${formatShortDate(date)} ${time.slice(0, 5)}`.trim();
}

function formatNodeCost(node: PlanNode) {
  if (node.costAmount === null || !node.costCurrency) {
    return '';
  }

  return formatMoney(node.costAmount, node.costCurrency);
}

function toNullableTrimmedValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
