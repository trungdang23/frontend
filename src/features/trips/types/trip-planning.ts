export type TripItineraryActivity = {
  id: string;
  itineraryDayId: string;
  title: string;
  startsAt: string | null;
  location: string | null;
  notes: string | null;
  costAmount: number;
  costCurrency: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TripItineraryDay = {
  id: string;
  tripId: string;
  date: string;
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
};

export type CreateItineraryActivityPayload = {
  title: string;
  startsAt?: string;
  location?: string;
  notes?: string;
  costAmount?: number;
  costCurrency?: string;
};
