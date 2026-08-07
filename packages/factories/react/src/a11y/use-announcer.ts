/**
 * useAnnouncer Hook
 *
 * Provides the props for a visually hidden live region plus an `announce`
 * function.
 *
 * Screen readers do not narrate arbitrary DOM changes. Anything that happens
 * without user input — rows finishing loading, a submit failing — is silent
 * unless it lands in a live region, so this is the only way those states get
 * communicated.
 */

import { useCallback, useMemo, useState } from 'react';
import type React from 'react';

export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * Style that hides content visually while keeping it in the accessibility
 * tree. `display: none` / `visibility: hidden` would remove it from both.
 */
export const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface UseAnnouncerResult {
  /** Announce a message to assistive technology */
  announce: (message: string, politeness?: AnnouncePoliteness) => void;
  /** Props to spread onto a `<div>` rendered somewhere stable in the tree */
  liveRegionProps: {
    role: 'status';
    'aria-live': AnnouncePoliteness;
    'aria-atomic': true;
    style: React.CSSProperties;
    children: string;
  };
}

export function useAnnouncer(
  defaultPoliteness: AnnouncePoliteness = 'polite'
): UseAnnouncerResult {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<AnnouncePoliteness>(defaultPoliteness);

  const announce = useCallback(
    (nextMessage: string, nextPoliteness: AnnouncePoliteness = defaultPoliteness) => {
      setPoliteness(nextPoliteness);
      // Re-announce identical consecutive messages: a live region only fires
      // when its text content actually changes, so clear it first.
      setMessage((current) => (current === nextMessage ? '' : nextMessage));
      if (nextMessage) {
        requestAnimationFrame(() => setMessage(nextMessage));
      }
    },
    [defaultPoliteness]
  );

  const liveRegionProps = useMemo(
    () =>
      ({
        role: 'status' as const,
        'aria-live': politeness,
        'aria-atomic': true as const,
        style: visuallyHiddenStyle,
        children: message,
      }),
    [politeness, message]
  );

  return { announce, liveRegionProps };
}
