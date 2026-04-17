export type TripItineraryActivity = {
  id: string;
  itineraryDayId: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  costAmount: number;
  costCurrency: string;
  position: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type TripItineraryDay = {
  id: string;
  tripId: string;
  date: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  costAmount: number;
  costCurrency: string;
  position: number;
  imageUrls: string[];
  activities: TripItineraryActivity[];
  createdAt: string;
  updatedAt: string;
};

export type TripItinerary = {
  tripId: string;
  startDate: string;
  endDate: string;
  days: TripItineraryDay[];
};

export type TripBudgetSummary = {
  tripId: string;
  currency: string;
  totalBudgetAmount: number;
  totalPlannedAmount: number;
  remainingAmount: number;
  totalDays: number;
  totalActivities: number;
  isOverBudget: boolean;
};

export type CreateItineraryDayPayload = {
  date: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  notes?: string;
  costAmount?: number;
  costCurrency?: string;
  imageUrls?: string[];
};

export type UpdateItineraryDayPayload = Partial<CreateItineraryDayPayload>;

export type CreateItineraryActivityPayload = {
  title: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  notes?: string;
  costAmount?: number;
  costCurrency?: string;
  imageUrls?: string[];
};

export type UpdateItineraryActivityPayload =
  Partial<CreateItineraryActivityPayload>;
