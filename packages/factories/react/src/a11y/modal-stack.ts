/**
 * Shared stack for open modal instances.
 *
 * A modal can use the default focus trap or a custom container. Keeping the
 * stack outside either component lets both variants agree on which instance
 * owns Escape and initial focus.
 */

export interface ModalStackEntry {
  token: object;
  registrationId: object;
  parentToken?: object;
  container: HTMLElement | null;
  onEscape: () => void;
}

const modalStack: ModalStackEntry[] = [];
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export function registerModal(
  token: object,
  onEscape: () => void,
  parentToken?: object
): () => boolean {
  const registrationId = {};
  const existing = modalStack.find((entry) => entry.token === token);
  if (existing) {
    existing.onEscape = onEscape;
    existing.parentToken = parentToken;
    existing.registrationId = registrationId;
  } else {
    modalStack.push({ token, registrationId, parentToken, container: null, onEscape });
  }

  return () => unregisterModal(token, registrationId);
}

export function unregisterModal(token: object, registrationId?: object): boolean {
  const index = modalStack.findIndex((entry) => entry.token === token);
  if (index < 0 || (registrationId && modalStack[index].registrationId !== registrationId)) {
    return false;
  }
  modalStack.splice(index, 1);
  return true;
}

export function attachModalContainer(
  token: object,
  container: HTMLElement,
  parentToken?: object
): void {
  const existing = modalStack.find((entry) => entry.token === token);
  if (existing) {
    existing.container = container;
    existing.parentToken = parentToken;
  } else {
    modalStack.push({
      token,
      registrationId: {},
      parentToken,
      container,
      onEscape: () => {},
    });
  }
}

export function detachModalContainer(token: object, container: HTMLElement): boolean {
  const entry = modalStack.find((candidate) => candidate.token === token);
  if (entry?.container !== container) return false;
  entry.container = null;
  return true;
}

/**
 * Nested relationships override registration order. Among unrelated modal
 * leaves, registration order is the open order, so the last leaf is topmost
 * even when a parent focus effect runs before its child can focus itself.
 */
export function isTopmostModal(token: object): boolean {
  const leafEntries = modalStack.filter(
    (entry) => !modalStack.some((candidate) => candidate.parentToken === entry.token)
  );
  return leafEntries[leafEntries.length - 1]?.token === token;
}

export function hasModalContainer(token: object): boolean {
  return Boolean(modalStack.find((entry) => entry.token === token)?.container);
}

export function getTopmostModal(excludeToken?: object): ModalStackEntry | undefined {
  const entries = modalStack.filter((entry) => entry.token !== excludeToken);
  const leafEntries = entries.filter(
    (entry) => !entries.some((candidate) => candidate.parentToken === entry.token)
  );
  return leafEntries[leafEntries.length - 1];
}

/** Focus the remaining topmost default container when a nested modal closes. */
export function focusTopmostModal(excludeToken?: object): void {
  const topmost = getTopmostModal(excludeToken);
  if (!topmost?.container || topmost.container.contains(document.activeElement)) return;

  const focusables = Array.from(
    topmost.container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );
  (focusables[0] ?? topmost.container).focus();
}
