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

  const run = (reactions: Record<string, string>, extra: Record<string, unknown> = {}, values: Record<string, unknown> = {}) => {
    const setFieldProps = vi.fn();
    const formAdapter = (extra.formAdapter ?? { getValues: () => values }) as any;
    executeDeclarativeReactions({ 'x-reactions': reactions }, {
      fieldKey: 'email', schema: {}, fullSchema: {}, setFieldProps, ...extra, formAdapter,
    });
    return setFieldProps;
  };

  it('only warns, once per form, about an absent $form path when no paths are declared', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const formAdapter = { getValues: () => ({}) };
    const strict = { expressions: { onError: 'throw' as const }, formAdapter };

    expect(run({ label: '$form.firstName' }, strict)).toHaveBeenCalledWith('email', { label: undefined });
    expect(run({ disabled: "$form.firstName == 'x'" }, strict)).toHaveBeenCalledWith('email', { disabled: false });
    expect(() => run({ label: '$form.firstName' }, strict)).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('stays quiet for a declared field that is still empty', () => {
    const report = vi.fn();
    const context = {
      declaredFormPaths: new Set(['firstName']),
      expressions: { onError: 'throw' as const, onExpressionError: report },
    };

    expect(run({ label: '$form.firstName' }, context)).toHaveBeenCalledWith('email', { label: undefined });
    expect(run({ disabled: "$form.firstName == 'x'" }, context)).toHaveBeenCalledWith('email', { disabled: false });
    expect(report).not.toHaveBeenCalled();
  });

  it('throws in strict mode for a path that is neither present nor declared', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const context = { declaredFormPaths: new Set(['firstName']), expressions: { onError: 'throw' as const } };

    expect(() => run({ disabled: '$form.fristName' }, context)).toThrow(
      expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$form.fristName' }),
    );
    expect(() => run({ disabled: '$form.firstName' }, context, { firstName: 'Ana' })).not.toThrow();
  });

  it('throws in strict mode for unknown roots and syntax errors, with or without declared paths', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const strict = { expressions: { onError: 'throw' as const } };

    expect(() => run({ disabled: '$formValues.firstName == 1' }, strict)).toThrow(
      expect.objectContaining({ code: 'UNKNOWN_EXPRESSION_VARIABLE' }),
    );
    expect(() => run({ disabled: '$form.firstName ==' }, strict)).toThrow(
      expect.objectContaining({ code: 'EXPRESSION_EVALUATION_ERROR' }),
    );
    expect(() => run({ disabled: '$form.firstName ==' }, strict)).toThrow(ScheptaExpressionError);
  });
});
