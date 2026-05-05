import { useEffect } from 'react';
import { useBeforeUnload } from 'react-router-dom';

type UseJournalExitGuardOptions = {
  message: string;
  when: boolean;
};

export function useJournalExitGuard({
  message,
  when,
}: UseJournalExitGuardOptions) {
  useBeforeUnload(
    (event) => {
      if (!when) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true },
  );

  useEffect(() => {
    if (!when) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target &&
        anchor.target !== '_self' &&
        anchor.target !== ''
      ) {
        return;
      }

      if (anchor.hasAttribute('download')) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search
      ) {
        return;
      }

      if (window.confirm(message)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [message, when]);
}
