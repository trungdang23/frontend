import { useEffect } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

type UseJournalExitGuardOptions = {
  message: string;
  when: boolean;
};

type JournalGuardLocation = {
  hash: string;
  pathname: string;
  search: string;
};

type BeforeUnloadGuardEvent = Pick<
  BeforeUnloadEvent,
  'preventDefault' | 'returnValue'
>;

type ResolveJournalNavigationBlockInput = {
  blockerState: 'blocked' | 'proceeding' | 'unblocked';
  confirmLeave: () => boolean;
  proceed?: () => void;
  reset?: () => void;
};

export function shouldBlockJournalNavigation(input: {
  currentLocation: JournalGuardLocation;
  nextLocation: JournalGuardLocation;
  when: boolean;
}) {
  if (!input.when) {
    return false;
  }

  return (
    input.currentLocation.pathname !== input.nextLocation.pathname ||
    input.currentLocation.search !== input.nextLocation.search ||
    input.currentLocation.hash !== input.nextLocation.hash
  );
}

export function applyBeforeUnloadJournalGuard(
  event: BeforeUnloadGuardEvent,
  when: boolean,
) {
  if (!when) {
    return;
  }

  event.preventDefault();
  event.returnValue = '';
}

export function resolveJournalNavigationBlock(
  input: ResolveJournalNavigationBlockInput,
) {
  if (input.blockerState !== 'blocked') {
    return;
  }

  if (input.confirmLeave()) {
    input.proceed?.();
    return;
  }

  input.reset?.();
}

export function useJournalExitGuard({
  message,
  when,
}: UseJournalExitGuardOptions) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return shouldBlockJournalNavigation({
      currentLocation,
      nextLocation,
      when,
    });
  });

  useBeforeUnload(
    (event) => {
      applyBeforeUnloadJournalGuard(event, when);
    },
    { capture: true },
  );

  useEffect(() => {
    resolveJournalNavigationBlock({
      blockerState: blocker.state,
      confirmLeave: () => window.confirm(message),
      proceed: blocker.proceed,
      reset: blocker.reset,
    });
  }, [blocker, message]);
}
