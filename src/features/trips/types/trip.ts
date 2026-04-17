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
  budgetAmount: number;
  budgetCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type TripSort = 'startDate,asc' | 'startDate,desc';

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
  budgetAmount: number;
  budgetCurrency: string;
};
