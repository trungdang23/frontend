import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/api-error';
import { resolvePlannerActivityServerError } from './activity-server-errors';

function createApiError(message: string) {
  return new ApiError({
    code: 'BAD_REQUEST',
    message,
    status: 400,
  });
}

describe('resolvePlannerActivityServerError', () => {
  it('maps backend activity time errors to planner fields', () => {
    expect(resolvePlannerActivityServerError(createApiError('Activity start and end times are required.'))).toEqual({
      field: 'time',
      kind: 'missingTime',
    });

    expect(
      resolvePlannerActivityServerError(createApiError('Activity time must be within the trip date range.')),
    ).toEqual({
      field: 'date',
      kind: 'outsideTripRange',
    });

    expect(
      resolvePlannerActivityServerError(createApiError('Activity time overlaps another activity in this trip.')),
    ).toEqual({
      field: 'time',
      kind: 'timeOverlap',
    });
  });

  it('keeps unknown errors out of activity field mapping', () => {
    expect(resolvePlannerActivityServerError(createApiError('Request failed.'))).toBeNull();
    expect(resolvePlannerActivityServerError(new Error('Network failed'))).toBeNull();
  });
});
