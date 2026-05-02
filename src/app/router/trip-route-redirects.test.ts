import { describe, expect, it } from 'vitest';
import {
  buildJournalCompatibilityPath,
  buildPlannerCompatibilityPath,
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
});
