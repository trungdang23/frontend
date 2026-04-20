import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { TripForm } from "@/features/trips/components/trip-form";
import { TripListItem } from "@/features/trips/components/trip-list-item";
import { TripShareCard } from "@/features/trips/components/trip-share-card";
import { formatTripBudgetBreakdown } from "@/features/trips/lib/trip-presenters";
import { TripFormValues } from "@/features/trips/lib/trip-form-validators";
import { TripBudgetSummary } from "@/features/trips/types/trip-planning";
import { Trip } from "@/features/trips/types/trip";
import { LanguageProvider } from "@/shared/i18n/language-provider";

function renderWithProviders(node: ReactNode) {
  render(
    <LanguageProvider>
      <MemoryRouter>{node}</MemoryRouter>
    </LanguageProvider>,
  );
}

function createInitialValues(
  overrides: Partial<TripFormValues> = {},
): TripFormValues {
  return {
    name: "",
    summaryNotes: "",
    coverImageUrl: "",
    startDate: "",
    endDate: "",
    budgetMode: "manual",
    manualBudgetAmount: "",
    manualBudgetCurrency: "VND",
    visibility: "private",
    ...overrides,
  };
}

function createTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-01",
    userId: "user-01",
    name: "Hoi An Lights",
    destination: null,
    summaryNotes: "Lanterns and coffee stops.",
    coverImageUrl: null,
    startDate: "2026-07-12",
    endDate: "2026-07-15",
    timezone: null,
    budgetMode: "manual",
    manualBudgetAmount: 3500000,
    manualBudgetCurrency: "VND",
    visibility: "public",
    budgetAmount: 3500000,
    budgetCurrency: "VND",
    createdAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z",
    ...overrides,
  };
}

function createBudgetSummary(
  overrides: Partial<TripBudgetSummary> = {},
): TripBudgetSummary {
  return {
    tripId: "trip-01",
    currency: "VND",
    totalBudgetAmount: 3500000,
    totalPlannedAmount: 1500000,
    remainingAmount: 2000000,
    totalDays: 1,
    totalActivities: 2,
    isOverBudget: false,
    hasMixedCurrencies: false,
    totalsByCurrency: [
      {
        currency: "VND",
        plannedAmount: 1500000,
        nodeCount: 2,
      },
    ],
    ...overrides,
  };
}

describe("Trip metadata phase 03", () => {
  it("submits the manual budget payload with visibility", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <TripForm
        cancelTo="/app/trips"
        initialValues={createInitialValues()}
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("Tên chuyến đi"),
      "Hoi An Lights",
    );
    await userEvent.type(screen.getByLabelText("Ngày bắt đầu"), "2026-07-12");
    await userEvent.type(screen.getByLabelText("Ngày kết thúc"), "2026-07-15");
    await userEvent.selectOptions(
      screen.getByLabelText("Mức hiển thị"),
      "public",
    );
    await userEvent.type(
      screen.getByLabelText("Ngân sách thủ công"),
      "3500000",
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: /tạo chuyến đi/i,
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Hoi An Lights",
        summaryNotes: null,
        coverImageUrl: null,
        startDate: "2026-07-12",
        endDate: "2026-07-15",
        budgetMode: "manual",
        manualBudgetAmount: 3500000,
        manualBudgetCurrency: "VND",
        visibility: "public",
      });
    });
  });

  it("clears manual budget fields from the payload in auto mode", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <TripForm
        cancelTo="/app/trips"
        initialValues={createInitialValues({
          budgetMode: "manual",
          manualBudgetAmount: "1500000",
          manualBudgetCurrency: "VND",
        })}
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Chế độ ngân sách"),
      "auto",
    );

    expect(
      screen.queryByLabelText("Ngân sách thủ công"),
    ).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Tên chuyến đi"), "Auto Budget");
    await userEvent.type(screen.getByLabelText("Ngày bắt đầu"), "2026-08-01");
    await userEvent.type(screen.getByLabelText("Ngày kết thúc"), "2026-08-05");
    await userEvent.click(
      screen.getByRole("button", {
        name: /tạo chuyến đi/i,
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Auto Budget",
        summaryNotes: null,
        coverImageUrl: null,
        startDate: "2026-08-01",
        endDate: "2026-08-05",
        budgetMode: "auto",
        manualBudgetAmount: null,
        manualBudgetCurrency: null,
        visibility: "private",
      });
    });
  });

  it("renders trip list metadata badges for visibility and budget mode", () => {
    renderWithProviders(<TripListItem trip={createTrip()} />);

    expect(screen.getByText("Công khai")).toBeInTheDocument();
    expect(screen.getByText("Thủ công")).toBeInTheDocument();
    expect(screen.getByText(/3\.500\.000/)).toBeInTheDocument();
  });

  it("formats a mixed-currency budget breakdown from the additive summary contract", () => {
    const breakdown = formatTripBudgetBreakdown(
      createBudgetSummary({
        hasMixedCurrencies: true,
        totalsByCurrency: [
          {
            currency: "VND",
            plannedAmount: 1500000,
            nodeCount: 2,
          },
          {
            currency: "USD",
            plannedAmount: 75,
            nodeCount: 1,
          },
        ],
      }),
      "vi",
    );

    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toContain("VND:");
    expect(breakdown[0]).toContain("1.500.000");
    expect(breakdown[1]).toContain("USD:");
    expect(breakdown[1]).toContain("75");
  });

  it("keeps only the create-post CTA in the public share card", async () => {
    renderWithProviders(<TripShareCard trip={createTrip()} />);

    expect(
      screen.queryByRole("button", {
        name: /sao chép link/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: /mở route public/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/\/trips\/trip-01$/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /tạo bài viết từ chuyến đi này/i,
      }),
    ).toHaveAttribute('href', '/app/community/new?tripId=trip-01');
  });

  it("shows a validation error when manual mode is missing the budget amount", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <TripForm
        cancelTo="/app/trips"
        initialValues={createInitialValues({
          budgetMode: "manual",
          manualBudgetAmount: "",
          manualBudgetCurrency: "VND",
        })}
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(screen.getByLabelText("Tên chuyến đi"), "Manual Trip");
    await userEvent.type(screen.getByLabelText("Ngày bắt đầu"), "2026-09-01");
    await userEvent.type(screen.getByLabelText("Ngày kết thúc"), "2026-09-03");
    await userEvent.click(
      screen.getByRole("button", {
        name: /tạo chuyến đi/i,
      }),
    );

    expect(
      await screen.findByText(
        "Ngân sách thủ công là bắt buộc khi chọn chế độ thủ công.",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
