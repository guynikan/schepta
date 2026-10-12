import { describe, expect, it, vi, afterEach } from 'vitest';
import jexl from 'jexl';
import { createExpressionDiagnostics, ScheptaExpressionError, type ExpressionDiagnosticDetails } from '../expressions/diagnostics';
import { executeDeclarativeReactions } from './reaction-engine';

afterEach(() => vi.restoreAllMocks());

// Form inputs produce strings, so this transform throws a TypeError for them.
jexl.addTransform('money', (value: number) => value.toFixed(2));

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

  describe.each([
    ['warn', 'warn'],
    ['strict', 'throw'],
  ] as const)('empty values and calls (%s mode)', (_mode, onError) => {
    const setup = (declared?: string[]) => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const report = vi.fn();
      const context = {
        ...(declared ? { declaredFormPaths: new Set(declared) } : {}),
        expressions: { onError, onExpressionError: report },
      };
      const reportedCodes = () => report.mock.calls.map(([error]) => error.code);
      return { context, report, reportedCodes };
    };

    it.each([[null], [undefined]])('stays quiet for an index into a declared field that is %s', empty => {
      const { context, report } = setup(['items', 'profile.nickname']);
      const values = { items: empty, profile: { nickname: empty } };

      expect(run({ disabled: "$form.items[0].name == 'x'" }, context, values)).not.toHaveBeenCalled();
      expect(run({ label: '$form.profile.nickname[0]' }, context, values)).not.toHaveBeenCalled();
      expect(report).not.toHaveBeenCalled();
    });

    it.each([[null], [undefined]])('only warns about an index into a %s field when no paths are declared', empty => {
      const { context, reportedCodes } = setup();

      expect(() => run({ label: '$form.items[0].name' }, context, { items: empty })).not.toThrow();
      expect(reportedCodes()).toEqual(['EXPRESSION_PATH_NOT_FOUND']);
    });

    it.each([
      ['$form.items[0].price|money'],
      ["$form.items[0].price|money == '10.00'"],
      ["$form.items[.price|money == '10.00'][0].price"],
    ])('reports the transform that throws in %s as an evaluation error', expression => {
      for (const declared of [['items'], undefined]) {
        const { context, reportedCodes } = setup(declared);
        const evaluate = () => run({ label: expression }, context, { items: [{ price: '10' }] });

        if (onError === 'throw') {
          expect(evaluate).toThrow(expect.objectContaining({ code: 'EXPRESSION_EVALUATION_ERROR', expression }));
        } else {
          expect(evaluate()).not.toHaveBeenCalled();
        }
        expect(reportedCodes()).toEqual(['EXPRESSION_EVALUATION_ERROR']);
      }
    });

    it('reports a TypeError that is not an empty index as an evaluation error', () => {
      const { context, reportedCodes } = setup(['items']);
      const row = { get price(): number { throw new TypeError('price is broken'); } };
      const evaluate = () => run({ label: '$form.items[0].price' }, context, { items: [row] });

      if (onError === 'throw') {
        expect(evaluate).toThrow(expect.objectContaining({ code: 'EXPRESSION_EVALUATION_ERROR' }));
      } else {
        expect(evaluate()).not.toHaveBeenCalled();
      }
      expect(reportedCodes()).toEqual(['EXPRESSION_EVALUATION_ERROR']);
    });

    it('stays quiet for an index that finds nothing deeper in a declared field', () => {
      const { context, report } = setup(['items']);
      const values = { items: [{ price: '10' }] };

      expect(run({ label: '$form.items[0].tags[1]' }, context, values)).not.toHaveBeenCalled();
      expect(run({ label: "$form.items[.tags[0] == 'a']" }, context, values)).not.toHaveBeenCalled();
      expect(report).not.toHaveBeenCalled();
    });

    it('treats an index into an undeclared null field as a missing path', () => {
      const { context, reportedCodes } = setup(['items']);
      const evaluate = () => run({ label: '$form.itms[0].name' }, context, { itms: null });

      if (onError === 'throw') {
        expect(evaluate).toThrow(expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$form.itms' }));
      } else {
        expect(evaluate()).not.toHaveBeenCalled();
      }
      expect(reportedCodes()).toEqual(['EXPRESSION_PATH_NOT_FOUND']);
    });

    it.each([
      ['$form.email.toUpperCase()'],
      ["$form.email.toUpperCase() == 'A'"],
      ['$form.emial.trim()'],
    ])('reports the method call %s as an evaluation error', expression => {
      const { context, reportedCodes } = setup(['email']);
      const evaluate = () => run({ label: expression }, context, { email: 'a@b.c' });

      if (onError === 'throw') {
        expect(evaluate).toThrow(expect.objectContaining({
          code: 'EXPRESSION_EVALUATION_ERROR',
          expression,
          message: expect.stringMatching(/JEXL does not support calling JavaScript methods.*transform/),
        }));
      } else {
        expect(evaluate()).not.toHaveBeenCalled();
      }
      expect(reportedCodes()).toEqual(['EXPRESSION_EVALUATION_ERROR']);
    });

    it('reports a forbidden segment JEXL cannot tokenize as a forbidden path', () => {
      const { context, reportedCodes } = setup(['email']);
      const evaluate = () => run({ label: '$form.constructor == 1' }, context);

      if (onError === 'throw') {
        expect(evaluate).toThrow(expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$form.constructor' }));
      } else {
        expect(evaluate()).not.toHaveBeenCalled();
      }
      expect(reportedCodes()).toEqual(['EXPRESSION_PATH_NOT_FOUND']);
    });
  });
});
