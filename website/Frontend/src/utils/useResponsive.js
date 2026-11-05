import { useCallback, useSyncExternalStore } from 'react';

/**
 * The consoles set layout dimensions with inline styles, which a CSS @media
 * block cannot override, so the narrow-screen decisions have to be made in JS.
 * One hook for the whole app keeps every breakpoint band identical.
 */
export const BREAKPOINT_TABLET = 768;
export const BREAKPOINT_PHONE = 480;
export const BREAKPOINT_SMALL = 360;

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Layouts that stack from the waist down. */
export const useIsMobile = () => useMediaQuery(`(max-width: ${BREAKPOINT_TABLET}px)`);

/** One column, larger tap targets, no side-by-side panels. */
export const useIsPhone = () => useMediaQuery(`(max-width: ${BREAKPOINT_PHONE}px)`);

/** The narrowest device we support; used to drop optional columns and chrome. */
export const useIsSmallPhone = () => useMediaQuery(`(max-width: ${BREAKPOINT_SMALL}px)`);
