import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { TripCoverImage } from "@/features/trips/components/trip-cover-image";
import {
  TripFormValues,
  createTripFormSchema,
  mapTripFormValuesToPayload,
} from "@/features/trips/lib/trip-form-validators";
import { TripUpsertPayload } from "@/features/trips/types/trip";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StatusBanner } from "@/shared/ui/status-banner";
import { Textarea } from "@/shared/ui/textarea";

type TripFormProps = {
  cancelTo: string;
  initialValues: TripFormValues;
  mode: "create" | "edit";
  onSubmit: (payload: TripUpsertPayload) => Promise<void>;
  submitError?: string | null;
};

function getDescribedBy(...ids: Array<string | undefined>) {
  const describedBy = ids.filter(Boolean).join(" ");

  return describedBy.length > 0 ? describedBy : undefined;
}

export function TripForm({
  cancelTo,
  initialValues,
  mode,
  onSubmit,
  submitError,
}: TripFormProps) {
  const { t } = useI18n();
  const schema = createTripFormSchema(t);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<TripFormValues>({
    defaultValues: initialValues,
  });

  const previewName = useWatch({ control, name: "name" })?.trim() ?? "";
  const previewCoverImageUrl =
    useWatch({ control, name: "coverImageUrl" }) ?? "";
  const budgetMode = useWatch({ control, name: "budgetMode" });
  const fieldErrorIds = {
    name: "trip-name-error",
    coverImageUrl: "trip-cover-image-url-error",
    startDate: "trip-start-date-error",
    endDate: "trip-end-date-error",
    visibility: "trip-visibility-error",
    budgetMode: "trip-budget-mode-error",
    manualBudgetAmount: "trip-manual-budget-amount-error",
    manualBudgetCurrency: "trip-manual-budget-currency-error",
    summaryNotes: "trip-summary-notes-error",
  } as const;
  const budgetModeDescriptionId =
    budgetMode === "auto" ? "trip-budget-mode-description" : undefined;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          field === "name" ||
          field === "summaryNotes" ||
          field === "coverImageUrl" ||
          field === "startDate" ||
          field === "endDate" ||
          field === "budgetMode" ||
          field === "manualBudgetAmount" ||
          field === "manualBudgetCurrency" ||
          field === "visibility"
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    await onSubmit(mapTripFormValuesToPayload(parsed.data));
  });

  return (
    <form className="space-y-6" onSubmit={submitHandler}>
      {submitError ? (
        <StatusBanner tone="danger">{submitError}</StatusBanner>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-name"
          >
            {t("trips.fields.name")}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.name ? fieldErrorIds.name : undefined,
            )}
            hasError={Boolean(errors.name)}
            id="trip-name"
            type="text"
            {...register("name")}
          />
          {errors.name ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.name}
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-cover-image-url"
          >
            {t("trips.fields.coverImageUrl")}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.coverImageUrl ? fieldErrorIds.coverImageUrl : undefined,
            )}
            hasError={Boolean(errors.coverImageUrl)}
            id="trip-cover-image-url"
            placeholder={t("trips.placeholders.coverImageUrl")}
            type="url"
            {...register("coverImageUrl")}
          />
          {errors.coverImageUrl ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.coverImageUrl}
            >
              {errors.coverImageUrl.message}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)]">
            <div className="relative h-52">
              <TripCoverImage
                alt={previewName || t("trips.preview.coverAltFallback")}
                className="absolute inset-0"
                imgClassName="h-full w-full object-cover"
                src={previewCoverImageUrl}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,0.1),rgba(12,24,18,0.75))]" />
              <div className="relative flex h-full items-end p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="break-words text-2xl font-semibold text-white">
                    {previewName || t("trips.preview.titleFallback")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-start-date"
          >
            {t("trips.fields.startDate")}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.startDate ? fieldErrorIds.startDate : undefined,
            )}
            hasError={Boolean(errors.startDate)}
            id="trip-start-date"
            type="date"
            {...register("startDate")}
          />
          {errors.startDate ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.startDate}
            >
              {errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-end-date"
          >
            {t("trips.fields.endDate")}
          </label>
          <Input
            aria-describedby={getDescribedBy(
              errors.endDate ? fieldErrorIds.endDate : undefined,
            )}
            hasError={Boolean(errors.endDate)}
            id="trip-end-date"
            type="date"
            {...register("endDate")}
          />
          {errors.endDate ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.endDate}
            >
              {errors.endDate.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-visibility"
          >
            {t("trips.fields.visibility")}
          </label>
          <select
            aria-describedby={getDescribedBy(
              errors.visibility ? fieldErrorIds.visibility : undefined,
            )}
            aria-invalid={Boolean(errors.visibility)}
            className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none transition focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]"
            id="trip-visibility"
            {...register("visibility")}
          >
            <option value="private">{t("trips.visibility.private")}</option>
            <option value="public">{t("trips.visibility.public")}</option>
          </select>
          {errors.visibility ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.visibility}
            >
              {errors.visibility.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-budget-mode"
          >
            {t("trips.fields.budgetMode")}
          </label>
          <select
            aria-describedby={getDescribedBy(
              errors.budgetMode ? fieldErrorIds.budgetMode : undefined,
              budgetModeDescriptionId,
            )}
            aria-invalid={Boolean(errors.budgetMode)}
            className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-white/80 px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none transition focus:border-[var(--color-forest)] focus:ring-4 focus:ring-[rgba(84,107,65,0.12)]"
            id="trip-budget-mode"
            {...register("budgetMode")}
          >
            <option value="manual">{t("trips.budget.modeManual")}</option>
            <option value="auto">{t("trips.budget.modeAuto")}</option>
          </select>
          {errors.budgetMode ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.budgetMode}
            >
              {errors.budgetMode.message}
            </p>
          ) : null}
        </div>

        {budgetMode === "manual" ? (
          <>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[var(--color-ink)]"
                htmlFor="trip-manual-budget-amount"
              >
                {t("trips.fields.manualBudgetAmount")}
              </label>
              <Input
                aria-describedby={getDescribedBy(
                  errors.manualBudgetAmount
                    ? fieldErrorIds.manualBudgetAmount
                    : undefined,
                )}
                hasError={Boolean(errors.manualBudgetAmount)}
                id="trip-manual-budget-amount"
                min="0"
                step="1000"
                type="number"
                {...register("manualBudgetAmount")}
              />
              {errors.manualBudgetAmount ? (
                <p
                  className="text-sm text-[var(--color-danger)]"
                  id={fieldErrorIds.manualBudgetAmount}
                >
                  {errors.manualBudgetAmount.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[var(--color-ink)]"
                htmlFor="trip-manual-budget-currency"
              >
                {t("trips.fields.manualBudgetCurrency")}
              </label>
              <Input
                aria-describedby={getDescribedBy(
                  errors.manualBudgetCurrency
                    ? fieldErrorIds.manualBudgetCurrency
                    : undefined,
                )}
                autoCapitalize="characters"
                className="uppercase"
                hasError={Boolean(errors.manualBudgetCurrency)}
                id="trip-manual-budget-currency"
                maxLength={3}
                placeholder={t("trips.placeholders.manualBudgetCurrency")}
                type="text"
                {...register("manualBudgetCurrency")}
              />
              {errors.manualBudgetCurrency ? (
                <p
                  className="text-sm text-[var(--color-danger)]"
                  id={fieldErrorIds.manualBudgetCurrency}
                >
                  {errors.manualBudgetCurrency.message}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div
            className="rounded-[1.5rem] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-4 py-4 text-sm leading-7 text-[var(--color-ink-soft)] md:col-span-2"
            id={budgetModeDescriptionId}
          >
            {t("trips.budget.autoDescription")}
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="trip-summary-notes"
          >
            {t("trips.fields.summaryNotes")}
          </label>
          <Textarea
            aria-describedby={getDescribedBy(
              errors.summaryNotes ? fieldErrorIds.summaryNotes : undefined,
            )}
            hasError={Boolean(errors.summaryNotes)}
            id="trip-summary-notes"
            placeholder={t("trips.placeholders.summaryNotes")}
            rows={5}
            {...register("summaryNotes")}
          />
          {errors.summaryNotes ? (
            <p
              className="text-sm text-[var(--color-danger)]"
              id={fieldErrorIds.summaryNotes}
            >
              {errors.summaryNotes.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" type="submit">
          {isSubmitting
            ? mode === "create"
              ? t("trips.actions.creating")
              : t("trips.actions.saving")
            : mode === "create"
              ? t("trips.actions.create")
              : t("trips.actions.save")}
        </Button>
        <Link
          className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-forest)] sm:w-auto"
          to={cancelTo}
        >
          {t("trips.actions.cancel")}
        </Link>
      </div>
    </form>
  );
}
