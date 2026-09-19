/**
 * useFocusTrap Hook
 *
 * Confines keyboard focus inside a container while it is active, and restores
 * focus to whatever was focused before on deactivation.
 *
 * This is what makes a modal dialog usable without a mouse: without it, Tab
 * walks straight out of the dialog into the page behind, which is still
 * visible but not meant to be reachable.
 */

import { useEffect, useRef } from 'react';
import {
  attachModalContainer,
  detachModalContainer,
  focusTopmostModal,
  getTopmostModal,
  hasModalContainer,
  isTopmostModal,
} from './modal-stack';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export interface UseFocusTrapOptions {
  /** Whether the trap is active */
  active: boolean;
  /**
   * Called when Escape is pressed. Bound at the document level so it fires
   * even when focus has not yet entered the container.
   */
  onEscape?: () => void;
  /** Lock scrolling of the document body while active */
  lockScroll?: boolean;
  /** Shared modal identity used to coordinate nested traps. */
  modalToken?: object;
  /** Parent modal identity, when this trap is rendered inside another modal. */
  parentModalToken?: object;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
  // `offsetParent === null` filters out elements hidden via display:none and
  // their descendants, which are focusable per the selector but not reachable.
  return nodes.filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );
}

/**
 * @returns Ref to attach to the container that should trap focus.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  active,
  onEscape,
  lockScroll = true,
  modalToken,
  parentModalToken,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // Ref so the document listener never needs re-binding when the handler
  // identity changes between renders.
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    if (modalToken) attachModalContainer(modalToken, container, parentModalToken);

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus inside: the first focusable child, or the container itself
    // (it carries tabIndex={-1} for exactly this case).
    // A nested modal may already have focused itself in an earlier effect from
    // the same commit. In that case the parent must leave focus untouched.
    const topmost = modalToken ? getTopmostModal() : undefined;
    if (
      !modalToken ||
      isTopmostModal(modalToken) ||
      (topmost !== undefined && !hasModalContainer(topmost.token))
    ) {
      const focusables = getFocusable(container);
      (focusables[0] ?? container).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalToken && !isTopmostModal(modalToken)) return;

      if (event.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const current = getFocusable(container);
      if (current.length === 0) {
        // Nothing to cycle through — keep focus pinned on the container.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = current[0];
      const last = current[current.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (activeElement && !container.contains(activeElement)) {
        // Focus escaped (e.g. programmatically) — pull it back in.
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    const previousOverflow = lockScroll ? document.body.style.overflow : undefined;
    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (modalToken) detachModalContainer(modalToken, container);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow ?? '';
      }
      // Restoring focus is what lets a keyboard user continue from where they
      // were instead of being dropped at the top of the document.
      previouslyFocusedRef.current?.focus?.();

      // Exclude this entry while its container is detached. Otherwise a
      // same-commit nested close sees the closing modal as the topmost entry,
      // and focus restoration to the still-open parent is skipped.
      focusTopmostModal(modalToken);
    };
  }, [active, lockScroll, modalToken, parentModalToken]);

  return containerRef;
}
