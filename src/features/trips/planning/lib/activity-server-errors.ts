import { ApiError } from '@/shared/api/api-error';

export type PlannerActivityServerErrorField = 'date' | 'time';

export type PlannerActivityServerError = {
  field: PlannerActivityServerErrorField;
  kind: 'endBeforeStart' | 'missingTime' | 'outsideTripRange' | 'timeOverlap';
};

const ACTIVITY_SERVER_ERROR_MESSAGES: Record<string, PlannerActivityServerError> = {
  'Activity end time must be after start time.': {
    field: 'time',
    kind: 'endBeforeStart',
  },
  'Activity start and end times are required.': {
    field: 'time',
    kind: 'missingTime',
  },
  'Activity time must be within the trip date range.': {
    field: 'date',
    kind: 'outsideTripRange',
  },
  'Activity time overlaps another activity in this trip.': {
    field: 'time',
    kind: 'timeOverlap',
  },
  'End at must be on or after start at.': {
    field: 'time',
    kind: 'endBeforeStart',
  },
};

export function resolvePlannerActivityServerError(error: unknown): PlannerActivityServerError | null {
  if (!(error instanceof ApiError)) {
    return null;
  }

  return ACTIVITY_SERVER_ERROR_MESSAGES[error.message] ?? null;
}
