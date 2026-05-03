export type TripBudgetMode = "auto" | "manual";
export type TripVisibility = "private" | "unlisted" | "public";

export type Trip = {
  id: string;
  userId: string;
  name: string;
  destination: string | null;
  summaryNotes: string | null;
  coverImageUrl: string | null;
  startDate: string;
  endDate: string;
  timezone: string | null;
  budgetMode: TripBudgetMode;
  manualBudgetAmount: number | null;
  manualBudgetCurrency: string | null;
  visibility: TripVisibility;
  budgetAmount: number;
  budgetCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type TripSort = "startDate,asc" | "startDate,desc";

export type TripListMeta = {
  page: number;
  size: number;
  sort: TripSort;
  totalElements: number;
  totalPages: number;
};

export type TripListQuery = {
  page: number;
  size: number;
  sort: TripSort;
};

export type TripListResult = {
  data: Trip[];
  meta: TripListMeta;
};

export type TripUpsertPayload = {
  name: string;
  destination?: string | null;
  summaryNotes: string | null;
  coverImageUrl: string | null;
  startDate: string;
  endDate: string;
  timezone?: string | null;
  budgetMode: TripBudgetMode;
  manualBudgetAmount: number | null;
  manualBudgetCurrency: string | null;
  visibility: TripVisibility;
};

export type TripUpdatePayload = Partial<TripUpsertPayload>;
