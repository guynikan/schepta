import { describe, expect, it } from 'vitest';
import { omitSchemaChildren, toSafeText } from './safe-text';

describe('toSafeText', () => {
  it('returns strings as is, HTML included', () => {
    expect(toSafeText('Label')).toBe('Label');
    expect(toSafeText('')).toBe('');
    expect(toSafeText('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>');
  });

  it('converts finite numbers with String', () => {
    expect(toSafeText(0)).toBe('0');
    expect(toSafeText(42)).toBe('42');
    expect(toSafeText(-1.5)).toBe('-1.5');
  });

  it('returns an empty string for every other value', () => {
    const forgedVNode = { __v_isVNode: true, type: 'img', props: { src: 'x', onerror: 'alert(1)' }, shapeFlag: 1 };
    const forgedReactElement = { $$typeof: 'react.element', type: 'img', props: {} };

    for (const value of [
      forgedVNode, forgedReactElement, {}, [], ['a'], [forgedVNode], true, false, null, undefined,
      () => 'text', Symbol('s'), NaN, Infinity, -Infinity, BigInt(1), new String('boxed'),
      { toString: () => '<img src=x onerror=alert(1)>' },
    ]) {
      expect(toSafeText(value)).toBe('');
    }
  });
});

describe('omitSchemaChildren', () => {
  it('removes the children key and keeps every other prop', () => {
    expect(omitSchemaChildren({ label: 'L', children: [{ __v_isVNode: true }] })).toEqual({ label: 'L' });
    expect('children' in omitSchemaChildren({ children: undefined })).toBe(false);
  });

  it('returns the same reference when there is nothing to remove', () => {
    const props = { label: 'L' };
    expect(omitSchemaChildren(props)).toBe(props);
    expect(omitSchemaChildren(undefined)).toBeUndefined();
    expect(omitSchemaChildren('text')).toBe('text');
  });
});
