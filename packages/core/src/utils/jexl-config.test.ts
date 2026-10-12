import { describe, expect, it } from 'vitest';
import { Jexl } from './jexl-config';

describe('Jexl configuration', () => {
  it('evaluates synchronously and propagates syntax errors', () => {
    expect(Jexl.evalSync('$formValues.count + 1', { $formValues: { count: 2 } })).toBe(3);
    expect(() => Jexl.evalSync('$formValues.', { $formValues: {} })).toThrow();
  });
});
