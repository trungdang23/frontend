import { describe, expect, it, vi } from 'vitest';
import {
  applyBeforeUnloadJournalGuard,
  resolveJournalNavigationBlock,
  shouldBlockJournalNavigation,
} from '@/features/journal/lib/use-journal-exit-guard';

describe('useJournalExitGuard helpers', () => {
  it('blocks navigation only when the destination changes and the guard is enabled', () => {
    expect(
      shouldBlockJournalNavigation({
        currentLocation: {
          hash: '',
          pathname: '/app/trips/trip-1/journal',
          search: '?page=1',
        },
        nextLocation: {
          hash: '',
          pathname: '/app/trips/trip-1/journal',
          search: '?page=1',
        },
        when: true,
      }),
    ).toBe(false);

    expect(
      shouldBlockJournalNavigation({
        currentLocation: {
          hash: '',
          pathname: '/app/trips/trip-1/journal',
          search: '?page=1',
        },
        nextLocation: {
          hash: '',
          pathname: '/app/profile',
          search: '',
        },
        when: true,
      }),
    ).toBe(true);

    expect(
      shouldBlockJournalNavigation({
        currentLocation: {
          hash: '',
          pathname: '/app/trips/trip-1/journal',
          search: '?page=1',
        },
        nextLocation: {
          hash: '#cover',
          pathname: '/app/trips/trip-1/journal',
          search: '?page=1',
        },
        when: false,
      }),
    ).toBe(false);
  });

  it('marks beforeunload as blocked while the guard is enabled', () => {
    const event = {
      preventDefault: vi.fn(),
      returnValue: true,
    } as unknown as BeforeUnloadEvent;

    applyBeforeUnloadJournalGuard(event, true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.returnValue).toBe('');
  });

  it('leaves beforeunload untouched when the guard is disabled', () => {
    const event = {
      preventDefault: vi.fn(),
      returnValue: true,
    } as unknown as BeforeUnloadEvent;

    applyBeforeUnloadJournalGuard(event, false);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.returnValue).toBe(true);
  });

  it('proceeds or resets the blocked navigation based on the confirm result', () => {
    const proceed = vi.fn();
    const reset = vi.fn();

    resolveJournalNavigationBlock({
      blockerState: 'blocked',
      confirmLeave: () => true,
      proceed,
      reset,
    });

    expect(proceed).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();

    resolveJournalNavigationBlock({
      blockerState: 'blocked',
      confirmLeave: () => false,
      proceed,
      reset,
    });

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
