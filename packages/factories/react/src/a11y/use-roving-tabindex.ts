/**
 * useRovingTabIndex Hook
 *
 * Implements the roving tabindex pattern: a composite widget (tab list, grid)
 * exposes exactly one tab stop, and the arrow keys move focus between its
 * items.
 *
 * Without this, every item is a tab stop — a 50-row table costs 50 presses of
 * Tab to skip. With it, Tab enters and leaves the widget in one press and the
 * arrows navigate inside it.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseRovingTabIndexOptions {
  /** Number of navigable items */
  itemCount: number;
  /** Which arrow keys navigate. `both` accepts all four. */
  orientation?: RovingOrientation;
  /** Index that should own the tab stop initially (defaults to 0) */
  activeIndex?: number;
  /** Items that must be skipped while navigating (e.g. disabled tabs) */
  isDisabled?: (index: number) => boolean;
  /** Wrap around at the ends. Defaults to true, as the ARIA APG recommends. */
  loop?: boolean;
  /** Called when navigation lands on a new index */
  onNavigate?: (index: number) => void;
}

export interface UseRovingTabIndexResult {
  /** Index that currently owns the tab stop */
  focusedIndex: number;
  /** Move the tab stop programmatically (without focusing) */
  setFocusedIndex: (index: number) => void;
  /** `tabIndex` value for the item at `index` */
  getTabIndex: (index: number) => 0 | -1;
  /** Ref callback registering the DOM node for the item at `index` */
  registerItem: (index: number) => (node: HTMLElement | null) => void;
  /** `onKeyDown` handler for the container or for each item */
  onKeyDown: (event: React.KeyboardEvent) => void;
  /**
   * `onFocus` handler for each item. Keeps the tab stop aligned with whatever
   * actually holds focus — focus can arrive by click or programmatically, not
   * only through this hook's own arrow handling.
   */
  onItemFocus: (index: number) => void;
}

export function useRovingTabIndex({
  itemCount,
  orientation = 'horizontal',
  activeIndex = 0,
  isDisabled,
  loop = true,
  onNavigate,
}: UseRovingTabIndexOptions): UseRovingTabIndexResult {
  const [focusedIndex, setFocusedIndex] = useState(activeIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  // Focus only follows keyboard navigation. Moving focus on any state change
  // would steal it from the user during unrelated re-renders.
  const shouldFocusRef = useRef(false);

  // Keep the tab stop in sync when the owner (e.g. the active tab) changes
  // externally, and clamp it if items disappear.
  useEffect(() => {
    setFocusedIndex((current) => {
      if (activeIndex >= 0 && activeIndex < itemCount) return activeIndex;
      return Math.min(current, Math.max(itemCount - 1, 0));
    });
  }, [activeIndex, itemCount]);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  const registerItem = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      itemRefs.current[index] = node;
    },
    []
  );

  const getTabIndex = useCallback(
    (index: number): 0 | -1 => (index === focusedIndex ? 0 : -1),
    [focusedIndex]
  );

  const findEnabled = useCallback(
    (start: number, step: number): number => {
      if (itemCount === 0) return -1;
      let index = start;
      // Bounded by itemCount so a fully disabled set cannot spin forever.
      for (let attempt = 0; attempt < itemCount; attempt++) {
        if (index < 0) {
          if (!loop) return -1;
          index = itemCount - 1;
        } else if (index >= itemCount) {
          if (!loop) return -1;
          index = 0;
        }
        if (!isDisabled?.(index)) return index;
        index += step;
      }
      return -1;
    },
    [itemCount, isDisabled, loop]
  );

  const moveTo = useCallback(
    (index: number) => {
      if (index < 0) return;
      shouldFocusRef.current = true;
      setFocusedIndex(index);
      onNavigate?.(index);
    },
    [onNavigate]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const horizontal = orientation === 'horizontal' || orientation === 'both';
      const vertical = orientation === 'vertical' || orientation === 'both';

      let next = -1;
      switch (event.key) {
        case 'ArrowRight':
          if (!horizontal) return;
          next = findEnabled(focusedIndex + 1, 1);
          break;
        case 'ArrowLeft':
          if (!horizontal) return;
          next = findEnabled(focusedIndex - 1, -1);
          break;
        case 'ArrowDown':
          if (!vertical) return;
          next = findEnabled(focusedIndex + 1, 1);
          break;
        case 'ArrowUp':
          if (!vertical) return;
          next = findEnabled(focusedIndex - 1, -1);
          break;
        case 'Home':
          next = findEnabled(0, 1);
          break;
        case 'End':
          next = findEnabled(itemCount - 1, -1);
          break;
        default:
          return;
      }

      if (next < 0) return;
      event.preventDefault();
      moveTo(next);
    },
    [orientation, focusedIndex, findEnabled, itemCount, moveTo]
  );

  const onItemFocus = useCallback((index: number) => {
    // Only track the tab stop — do not re-focus, or this would loop.
    setFocusedIndex(index);
  }, []);

  return {
    focusedIndex,
    setFocusedIndex,
    getTabIndex,
    registerItem,
    onKeyDown,
    onItemFocus,
  };
}
