import { useEffect, useCallback, type RefObject } from 'react';

/**
 * Shared hook: calls `onOutsideClick` whenever a mousedown event
 * occurs outside the element pointed to by `ref`.
 *
 * Replaces ad-hoc implementations previously duplicated across
 * ProfileMenu, NotificationPanel, and GenreDropdown.
 */
export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void
) {
  const handler = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    },
    [ref, onOutsideClick]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [handler]);
}
