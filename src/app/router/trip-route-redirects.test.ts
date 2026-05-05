import { describe, expect, it } from 'vitest';
import {
  buildJournalCompatibilityPath,
  buildJournalTripPath,
  buildPlannerCompatibilityPath,
  buildPlannerTripPath,
} from '@/app/router/trip-route-redirects';

describe('trip route compatibility redirects', () => {
  it('keeps canonical planner paths on the existing planner flow', () => {
    expect(buildPlannerCompatibilityPath('trip-1')).toBe('/app/planner?tripId=trip-1');
  });

  it('preserves existing planner query state while replacing the trip id', () => {
    expect(buildPlannerCompatibilityPath('trip-2', '?page=activities&tripId=old&nodeId=node-1')).toBe(
      '/app/planner?page=activities&tripId=trip-2&nodeId=node-1',
    );
  });

  it('keeps canonical journal paths on the existing journal route', () => {
    expect(buildJournalCompatibilityPath('trip 1')).toBe('/app/journal?tripId=trip+1');
  });

  it('builds canonical planner trip routes while removing compatibility tripId', () => {
    expect(buildPlannerTripPath('trip 2', '?page=list&tripId=old')).toBe(
      '/app/trips/trip%202/planner?page=list',
    );
  });

  it('builds canonical journal trip routes while preserving unrelated query state', () => {
    expect(buildJournalTripPath('trip/1', '?source=profile&tripId=old')).toBe(
      '/app/trips/trip%2F1/journal?source=profile',
    );
  });
});
