/**
 * Shared stack for open modal instances.
 *
 * A modal can use the default focus trap or a custom container. Keeping the
 * stack outside either component lets both variants agree on which instance
 * owns Escape and initial focus.
 */

export interface ModalStackEntry {
  token: object;
  parentToken?: object;
  container: HTMLElement | null;
  onEscape: () => void;
}

const modalStack: ModalStackEntry[] = [];

export function registerModal(
  token: object,
  onEscape: () => void,
  parentToken?: object
): () => void {
  const existing = modalStack.find((entry) => entry.token === token);
  if (existing) {
    existing.onEscape = onEscape;
    existing.parentToken = parentToken;
  } else {
    modalStack.push({ token, parentToken, container: null, onEscape });
  }

  return () => unregisterModal(token);
}

export function unregisterModal(token: object): void {
  const index = modalStack.findIndex((entry) => entry.token === token);
  if (index >= 0) modalStack.splice(index, 1);
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
    modalStack.push({ token, parentToken, container, onEscape: () => {} });
  }
}

export function detachModalContainer(token: object, container: HTMLElement): void {
  const entry = modalStack.find((candidate) => candidate.token === token);
  if (entry?.container === container) entry.container = null;
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

export function getTopmostModal(): ModalStackEntry | undefined {
  const leafEntries = modalStack.filter(
    (entry) => !modalStack.some((candidate) => candidate.parentToken === entry.token)
  );
  return leafEntries[leafEntries.length - 1];
}
