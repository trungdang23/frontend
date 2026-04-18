import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createTrip } from "@/features/trips/api/trips-api";
import { TripForm } from "@/features/trips/components/trip-form";
import { getTripFormDefaults } from "@/features/trips/lib/trip-form-defaults";
import { TripUpsertPayload } from "@/features/trips/types/trip";
import { useI18n } from "@/shared/i18n/use-i18n";
import { ApiError } from "@/shared/api/api-error";
import { Card } from "@/shared/ui/card";
import { getButtonClasses } from "@/shared/ui/button-styles";

export function TripCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const initialValues = useMemo(() => getTripFormDefaults(), []);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (payload: TripUpsertPayload) => {
      setSubmitError(null);

      try {
        const trip = await createTrip(payload);
        await queryClient.invalidateQueries({ queryKey: ["trips", "list"] });
        queryClient.setQueryData(["trips", "detail", trip.id], trip);
        navigate(`/app/trips/${trip.id}`, {
          replace: true,
          state: { noticeKey: "trips.feedback.createSuccess" },
        });
      } catch (error) {
        setSubmitError(
          error instanceof ApiError && error.message
            ? error.message
            : t("trips.feedback.createError"),
        );
      }
    },
    [navigate, queryClient, t],
  );

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <p className="eyebrow-text text-[var(--color-forest)]">
          {t("trips.createEyebrow")}
        </p>
        <div className="space-y-2">
          <h1 className="headline text-4xl text-[var(--color-ink)]">
            {t("trips.createTitle")}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            {t("trips.createDescription")}
          </p>
        </div>
        <div>
          <Link className={getButtonClasses("secondary")} to="/app/trips">
            {t("trips.actions.backToList")}
          </Link>
        </div>
      </Card>

      <Card>
        <TripForm
          cancelTo="/app/trips"
          initialValues={initialValues}
          mode="create"
          onSubmit={handleCreate}
          submitError={submitError}
        />
      </Card>
    </div>
  );
}
