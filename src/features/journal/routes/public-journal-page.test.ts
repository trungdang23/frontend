import { describe, expect, it } from 'vitest';
import { canShowPublicJournalPlannerLink } from '@/features/journal/lib/public-journal-page';

describe('public journal page planner CTA guard', () => {
  it('hides the planner CTA while the trip itself is still private', () => {
    expect(canShowPublicJournalPlannerLink('private')).toBe(false);
  });

  it('shows the planner CTA only when the trip is public', () => {
    expect(canShowPublicJournalPlannerLink('public')).toBe(true);
  });
});
