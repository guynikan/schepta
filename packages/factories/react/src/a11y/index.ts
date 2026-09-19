/**
 * Accessibility primitives shared by the built-in React factories.
 *
 * These are exported publicly so that custom components registered through
 * `components` / `customComponents` can meet the same accessibility contract
 * as the built-ins.
 */

export { useA11yIds, composeDescribedBy, type A11yIds } from './use-a11y-ids';
export {
  useRovingTabIndex,
  type RovingOrientation,
  type UseRovingTabIndexOptions,
  type UseRovingTabIndexResult,
} from './use-roving-tabindex';
export { useFocusTrap, type UseFocusTrapOptions } from './use-focus-trap';
export {
  useAnnouncer,
  visuallyHiddenStyle,
  type AnnouncePoliteness,
  type UseAnnouncerResult,
} from './use-announcer';
