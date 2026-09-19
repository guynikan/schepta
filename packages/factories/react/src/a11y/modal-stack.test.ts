import { describe, expect, it } from 'vitest';
import {
  attachModalContainer,
  detachModalContainer,
  getTopmostModal,
  registerModal,
} from './modal-stack';

describe('modal stack lifecycle', () => {
  it('does not let a stale effect cleanup unregister a newer registration', () => {
    const token = {};
    const oldCleanup = registerModal(token, () => {});
    const newCleanup = registerModal(token, () => {});

    oldCleanup();
    expect(getTopmostModal()?.token).toBe(token);

    newCleanup();
    expect(getTopmostModal()).toBeUndefined();
  });

  it('can resolve the outer default container while the inner trap cleans up', () => {
    const outerToken = {};
    const innerToken = {};
    const outerCleanup = registerModal(outerToken, () => {});
    const innerCleanup = registerModal(innerToken, () => {}, outerToken);
    const outer = document.createElement('div');
    const replacement = document.createElement('div');
    document.body.appendChild(outer);
    document.body.appendChild(replacement);
    attachModalContainer(outerToken, outer, undefined);

    expect(getTopmostModal(innerToken)?.token).toBe(outerToken);
    attachModalContainer(outerToken, replacement, undefined);
    expect(detachModalContainer(outerToken, outer)).toBe(false);
    expect(getTopmostModal(innerToken)?.container).toBe(replacement);

    innerCleanup();
    outerCleanup();
    outer.remove();
    replacement.remove();
  });

});
