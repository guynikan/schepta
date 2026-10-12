import { describe, expect, it, vi, afterEach } from 'vitest';
import { createExpressionDiagnostics, type ExpressionDiagnosticDetails } from '../expressions/diagnostics';
import { executeDeclarativeReactions } from './reaction-engine';

afterEach(() => vi.restoreAllMocks());

describe('executeDeclarativeReactions', () => {
  it('diagnoses reactions that resolve to undefined instead of applying them', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const diagnostics: ExpressionDiagnosticDetails[] = [];
    const setFieldProps = vi.fn();

    executeDeclarativeReactions({ 'x-reactions': { disabled: '$form.missing' } }, {
      fieldKey: 'email',
      schema: {},
      fullSchema: {},
      formAdapter: { getValues: () => ({}) } as any,
      setFieldProps,
      expressionDiagnostics: createExpressionDiagnostics({
        onExpressionError: error => diagnostics.push({
          code: error.code, expression: error.expression, path: error.path,
        }),
      }),
    });

    expect(setFieldProps).not.toHaveBeenCalled();
    expect(diagnostics).toEqual([expect.objectContaining({
      code: 'EXPRESSION_EVALUATION_ERROR', expression: '$form.missing', path: 'email.x-reactions.disabled',
    })]);
  });
});
