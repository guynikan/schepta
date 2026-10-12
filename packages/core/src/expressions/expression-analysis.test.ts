import { describe, expect, it } from 'vitest';
import { analyzeExpression, getExpressionCacheSize } from './expression-analysis';

describe('analyzeExpression', () => {
  it('returns the same analysis for a repeated expression', () => {
    expect(analyzeExpression('$formValues.a == 1')).toBe(analyzeExpression('$formValues.a == 1'));
  });

  it('keeps the cache bounded for generated schemas', () => {
    const kept = analyzeExpression('$formValues.kept == 1');
    for (let index = 0; index < 5000; index++) {
      analyzeExpression(`$formValues.field${index} == ${index}`);
      // Recently used entries survive eviction.
      if (index % 500 === 0) analyzeExpression('$formValues.kept == 1');
    }

    expect(getExpressionCacheSize()).toBeLessThanOrEqual(2000);
    expect(analyzeExpression('$formValues.kept == 1')).toBe(kept);
    expect(analyzeExpression('$formValues.field0 == 0').references).toHaveLength(1);
  });

  it('caches failed parses without growing past the bound either', () => {
    for (let index = 0; index < 3000; index++) analyzeExpression(`${index} ===`);

    expect(getExpressionCacheSize()).toBeLessThanOrEqual(2000);
    expect(analyzeExpression('1 ===').error).toBeDefined();
  });
});
