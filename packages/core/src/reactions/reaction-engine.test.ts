import { describe, expect, it, vi, afterEach } from 'vitest';
import { createExpressionDiagnostics, ScheptaExpressionError, type ExpressionDiagnosticDetails } from '../expressions/diagnostics';
import { executeDeclarativeReactions } from './reaction-engine';

afterEach(() => vi.restoreAllMocks());

describe('executeDeclarativeReactions', () => {
  it('diagnoses missing reactions and preserves the undefined prop update', () => {
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

    expect(setFieldProps).toHaveBeenCalledWith('email', { disabled: undefined });
    expect(diagnostics).toEqual([expect.objectContaining({
      code: 'EXPRESSION_PATH_NOT_FOUND', expression: '$form.missing', path: 'email.x-reactions.disabled',
    })]);
  });

  it('throws for missing reaction paths in strict mode', () => {
    expect(() => executeDeclarativeReactions({ 'x-reactions': { disabled: '$form.missing' } }, {
      fieldKey: 'email',
      schema: {},
      fullSchema: {},
      formAdapter: { getValues: () => ({}) } as any,
      setFieldProps: vi.fn(),
      expressions: { onError: 'throw' },
    })).toThrow(ScheptaExpressionError);
  });
});
