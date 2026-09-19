import { describe, expect, it } from 'vitest';
import {
  attachModalContainer,
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
    document.body.appendChild(outer);
    attachModalContainer(outerToken, outer, undefined);

    expect(getTopmostModal(innerToken)?.token).toBe(outerToken);

    innerCleanup();
    outerCleanup();
    outer.remove();
  });

});
