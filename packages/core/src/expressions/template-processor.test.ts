/**
 * Template Processor Tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  processTemplateString,
  processTemplateExpression,
  processValue,
  needsProcessing,
} from './template-processor';
import { createCustomResolver, createDefaultResolver, type ResolverContext } from './variable-resolver';
import {
  createExpressionDiagnostics,
  ScheptaExpressionError,
  type ExpressionDiagnosticDetails,
} from './diagnostics';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Template Processor', () => {
  const context: ResolverContext = {
    externalContext: {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      api: 'https://api.example.com',
    },
    formValues: {
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const resolver = createDefaultResolver(context);

  describe('processTemplateString', () => {
    it('should replace single template expression', () => {
      const result = processTemplateString(
        'Hello {{ $externalContext.user.name }}',
        resolver,
        context,
      );
      expect(result).toBe('Hello John Doe');
    });

    it('should replace multiple template expressions', () => {
      const result = processTemplateString(
        '{{ $externalContext.user.name }} - {{ $formValues.firstName }}',
        resolver,
        context,
      );
      expect(result).toBe('John Doe - John');
    });

    it('should handle strings without templates', () => {
      const result = processTemplateString(
        'Hello world',
        resolver,
        context,
      );
      expect(result).toBe('Hello world');
    });

    it('should replace with empty string if value is undefined', () => {
      const result = processTemplateString(
        'Hello {{ $externalContext.nonexistent }}',
        resolver,
        context,
      );
      expect(result).toBe('Hello ');
    });

    it('should convert non-string values to string when interpolated', () => {
      const customContext: ResolverContext = {
        externalContext: { count: 42 },
        formValues: {},
      };
      const customResolver = createDefaultResolver(customContext);
      
      const result = processTemplateString(
        'Count: {{ $externalContext.count }}',
        customResolver,
        customContext,
      );
      expect(result).toBe('Count: 42');
    });

    it('should preserve type for single template expressions', () => {
      const customContext: ResolverContext = {
        externalContext: { count: 42, active: true },
        formValues: {},
      };
      const customResolver = createDefaultResolver(customContext);
      
      // Single template should preserve number type
      const numberResult = processTemplateString(
        '{{ $externalContext.count }}',
        customResolver,
        customContext,
      );
      expect(numberResult).toBe(42);
      expect(typeof numberResult).toBe('number');

      // Single template should preserve boolean type
      const boolResult = processTemplateString(
        '{{ $externalContext.active }}',
        customResolver,
        customContext,
      );
      expect(boolResult).toBe(true);
      expect(typeof boolResult).toBe('boolean');
    });
  });

  describe('processTemplateExpression', () => {
    it('should resolve expression directly', () => {
      const result = processTemplateExpression(
        '$externalContext.user.name',
        resolver,
      );
      expect(result).toBe('John Doe');
    });

    it('should return undefined for unknown expressions', () => {
      const result = processTemplateExpression(
        '$externalContext.nonexistent',
        resolver,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('processValue', () => {
    it('should process strings with templates', () => {
      const result = processValue(
        'Hello {{ $externalContext.user.name }}',
        resolver,
        context
      );
      expect(result).toBe('Hello John Doe');
    });

    it('should process objects recursively', () => {
      const value = {
        label: '{{ $externalContext.user.name }}',
        placeholder: 'Enter {{ $formValues.firstName }}',
        static: 'unchanged',
      };

      const result = processValue(value, resolver, context);
      
      expect(result).toEqual({
        label: 'John Doe',
        placeholder: 'Enter John',
        static: 'unchanged',
      });
    });

    it('should process arrays recursively', () => {
      const value = [
        '{{ $externalContext.user.name }}',
        '{{ $formValues.firstName }}',
        'static',
      ];

      const result = processValue(value, resolver, context);
      
      expect(result).toEqual(['John Doe', 'John', 'static']);
    });

    it('should process nested objects', () => {
      const value = {
        ui: {
          label: '{{ $externalContext.user.name }}',
          nested: {
            placeholder: '{{ $formValues.firstName }}',
          },
        },
      };

      const result = processValue(value, resolver, context);
      
      expect(result).toEqual({
        ui: {
          label: 'John Doe',
          nested: {
            placeholder: 'John',
          },
        },
      });
    });

    it('should handle null/undefined', () => {
      expect(processValue(null, resolver, context)).toBeNull();
      expect(processValue(undefined, resolver, context)).toBeUndefined();
    });

    it('should handle primitives unchanged', () => {
      expect(processValue(123, resolver, context)).toBe(123);
      expect(processValue(true, resolver, context)).toBe(true);
      expect(processValue(false, resolver, context)).toBe(false);
    });

    it('should handle mixed structures', () => {
      const value = {
        label: '{{ $externalContext.user.name }}',
        count: 42,
        items: [
          '{{ $formValues.firstName }}',
          'static',
        ],
        nested: {
          text: '{{ $externalContext.api }}',
        },
      };

      const result = processValue(value, resolver, context);
      
      expect(result).toEqual({
        label: 'John Doe',
        count: 42,
        items: ['John', 'static'],
        nested: {
          text: 'https://api.example.com',
        },
      });
    });
  });

  describe('needsProcessing', () => {
    it('should return true for values with templates', () => {
      expect(needsProcessing('{{ $externalContext.user.name }}')).toBe(true);
      expect(needsProcessing({
        label: '{{ $formValues.firstName }}',
      })).toBe(true);
    });

    it('should return false for values without templates', () => {
      expect(needsProcessing('Hello world')).toBe(false);
      expect(needsProcessing({ label: 'static' })).toBe(false);
      expect(needsProcessing(123)).toBe(false);
    });
  });

  describe('JEXL expressions', () => {
    it('should evaluate equality expressions and return boolean', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: {
          status: 'active',
          userInfo: {
            maritalStatus: 'married',
          },
        },
      };
      const testResolver = createDefaultResolver(testContext);

      // Simple equality
      const result1 = processTemplateString(
        "{{ $formValues.status === 'active' }}",
        testResolver,
        testContext,
      );
      expect(result1).toBe(true);
      expect(typeof result1).toBe('boolean');

      // Nested path equality
      const result2 = processTemplateString(
        "{{ $formValues.userInfo.maritalStatus === 'married' }}",
        testResolver,
        testContext,
      );
      expect(result2).toBe(true);
      expect(typeof result2).toBe('boolean');

      // False case
      const result3 = processTemplateString(
        "{{ $formValues.status === 'inactive' }}",
        testResolver,
        testContext,
      );
      expect(result3).toBe(false);
      expect(typeof result3).toBe('boolean');
    });

    it('should evaluate inequality expressions', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: { status: 'active' },
      };
      const testResolver = createDefaultResolver(testContext);

      const result = processTemplateString(
        "{{ $formValues.status !== 'inactive' }}",
        testResolver,
        testContext,
      );
      expect(result).toBe(true);
    });

    it('should evaluate logical AND expressions', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: { a: true, b: true, c: false },
      };
      const testResolver = createDefaultResolver(testContext);

      const result1 = processTemplateString(
        '{{ $formValues.a && $formValues.b }}',
        testResolver,
        testContext,
      );
      expect(result1).toBe(true);

      const result2 = processTemplateString(
        '{{ $formValues.a && $formValues.c }}',
        testResolver,
        testContext,
      );
      expect(result2).toBe(false);
    });

    it('should evaluate logical OR expressions', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: { a: true, b: false },
      };
      const testResolver = createDefaultResolver(testContext);

      const result = processTemplateString(
        '{{ $formValues.a || $formValues.b }}',
        testResolver,
        testContext,
      );
      expect(result).toBe(true);
    });

    it('should evaluate comparison expressions', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: { age: 25, minAge: 18 },
      };
      const testResolver = createDefaultResolver(testContext);

      const result1 = processTemplateString(
        '{{ $formValues.age >= 18 }}',
        testResolver,
        testContext,
      );
      expect(result1).toBe(true);

      const result2 = processTemplateString(
        '{{ $formValues.age > $formValues.minAge }}',
        testResolver,
        testContext,
      );
      expect(result2).toBe(true);

      const result3 = processTemplateString(
        '{{ $formValues.age < 18 }}',
        testResolver,
        testContext,
      );
      expect(result3).toBe(false);
    });

    it('should evaluate complex expressions in processValue', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: {
          userInfo: {
            maritalStatus: 'married',
          },
        },
      };
      const testResolver = createDefaultResolver(testContext);

      const value = {
        label: 'Spouse Name',
        disabled: "{{ $formValues.userInfo.maritalStatus === 'married' }}",
      };

      const result = processValue(value, testResolver, testContext);
      
      expect(result).toEqual({
        label: 'Spouse Name',
        disabled: true,
      });
      expect(typeof result.disabled).toBe('boolean');
    });

    it('should handle complex expressions with externalContext', () => {
      const testContext: ResolverContext = {
        externalContext: {
          user: { role: 'admin' },
        },
        formValues: {},
      };
      const testResolver = createDefaultResolver(testContext);

      const result = processTemplateString(
        "{{ $externalContext.user.role === 'admin' }}",
        testResolver,
        testContext,
      );
      expect(result).toBe(true);
    });

    it('should handle undefined values in expressions gracefully', () => {
      const testContext: ResolverContext = {
        externalContext: {},
        formValues: {},
      };
      const testResolver = createDefaultResolver(testContext);

      // Should not throw, return undefined or false
      const result = processTemplateString(
        "{{ $formValues.nonexistent === 'value' }}",
        testResolver,
        testContext,
      );
      expect(result).toBe(false);
    });
  });

  describe('expression diagnostics', () => {
    function diagnosticContext(
      diagnostics: ExpressionDiagnosticDetails[],
      strict = false,
    ): ResolverContext {
      return {
        externalContext: {},
        formValues: {},
        declaredFormPaths: new Set(['email']),
        diagnostics: createExpressionDiagnostics({
          onError: strict ? 'throw' : 'warn',
          onExpressionError: error => diagnostics.push({
            code: error.code,
            expression: error.expression,
            path: error.path,
            missingPath: error.missingPath,
          }),
        }),
      };
    }

    it('reports syntax errors once with their expression and schema usage path', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);
      const value = { 'x-ui': { visible: '{{ 1 === }}' } };

      expect(processValue(value, diagnosticResolver, diagnosticContextValue)).toEqual({
        'x-ui': { visible: undefined },
      });
      expect(diagnostics).toEqual([expect.objectContaining({
        code: 'EXPRESSION_EVALUATION_ERROR',
        expression: '1 ===',
        path: 'x-ui.visible',
      })]);
    });

    it('reports unknown roots and missing paths without changing default resolution', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);

      expect(processValue({ unknown: '{{ $typo.value }}', missing: '{{ $formValues.emial }}' }, diagnosticResolver, diagnosticContextValue)).toEqual({
        unknown: undefined,
        missing: undefined,
      });
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'UNKNOWN_EXPRESSION_VARIABLE', expression: '$typo.value', path: 'unknown',
        }),
        expect.objectContaining({
          code: 'EXPRESSION_PATH_NOT_FOUND', expression: '$formValues.emial', path: 'missing', missingPath: '$formValues.emial',
        }),
      ]);
    });

    it('checks references inside comparisons and keeps strict error details', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const context = diagnosticContext(diagnostics, true);
      const resolver = createDefaultResolver(context);

      expect(() => processValue("{{ $formValues.emial === 'a' }}", resolver, context, 'x-ui.visible')).toThrow(
        expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$formValues.emial' }),
      );
      expect(diagnostics).toEqual([expect.objectContaining({
        code: 'EXPRESSION_PATH_NOT_FOUND', path: 'x-ui.visible', missingPath: '$formValues.emial',
      })]);
    });

    it('keeps declared but empty fields quiet and preserves undefined behavior', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);

      expect(processValue('{{ $formValues.email }}', diagnosticResolver, diagnosticContextValue, 'x-ui.label')).toBeUndefined();
      expect(diagnostics).toEqual([]);
    });

    it('deduplicates repeated diagnostics and throws typed errors only in strict mode', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);
      const value = '{{ $formValues.emial }}';

      processValue(value, diagnosticResolver, diagnosticContextValue, 'x-ui.disabled');
      processValue(value, diagnosticResolver, diagnosticContextValue, 'x-ui.disabled');
      expect(diagnostics).toHaveLength(1);

      const strictDiagnostics: ExpressionDiagnosticDetails[] = [];
      const strictContext = diagnosticContext(strictDiagnostics, true);
      expect(() => processValue(value, createDefaultResolver(strictContext), strictContext, 'x-ui.required')).toThrow(ScheptaExpressionError);
      expect(strictDiagnostics[0]).toMatchObject({
        code: 'EXPRESSION_PATH_NOT_FOUND', expression: '$formValues.emial', path: 'x-ui.required',
      });

      expect(() => processValue(value, createDefaultResolver(strictContext), strictContext, 'x-ui.required')).toThrow(ScheptaExpressionError);
      expect(() => processValue(value, createDefaultResolver(strictContext), strictContext, 'x-ui.required')).toThrow(ScheptaExpressionError);
    });

    it('keeps the value main produced for invalid conditions and reports each location', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);
      const value = {
        'x-ui': {
          visible: '{{ $formValues.emial }}',
          disabled: '{{ $formValues.emial }}',
          required: '{{ $formValues.emial }}',
        },
      };

      expect(processValue(value, diagnosticResolver, diagnosticContextValue)).toEqual({
        'x-ui': { visible: undefined, disabled: undefined, required: undefined },
      });
      expect(diagnostics.map(error => error.path)).toEqual([
        'x-ui.visible', 'x-ui.disabled', 'x-ui.required',
      ]);
    });

    it('does not diagnose missing references hidden by a fallback or string literal', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);
      const diagnosticResolver = createDefaultResolver(diagnosticContextValue);

      expect(processValue("{{ $externalContext.locale || 'en' }}", diagnosticResolver, diagnosticContextValue)).toBe('en');
      expect(processValue("{{ '$USD' }}", diagnosticResolver, diagnosticContextValue)).toBe('$USD');
      expect(diagnostics).toEqual([]);
    });

    it('classifies invalid non-comparison syntax as an evaluation error', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const diagnosticContextValue = diagnosticContext(diagnostics);

      expect(processValue('{{ $formValues.email + }}', createDefaultResolver(diagnosticContextValue), diagnosticContextValue)).toBeUndefined();
      expect(diagnostics).toEqual([expect.objectContaining({
        code: 'EXPRESSION_EVALUATION_ERROR', expression: '$formValues.email +',
      })]);
    });

    it('blocks prototype-chain segments before JEXL can expose constructors', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const diagnostics: ExpressionDiagnosticDetails[] = [];
      const context = diagnosticContext(diagnostics);

      expect(processValue(
        '{{ $formValues.constructor.constructor }}',
        createDefaultResolver(context),
        context,
        'x-ui.visible',
      )).toBeUndefined();
      expect(diagnostics).toEqual([expect.objectContaining({
        code: 'EXPRESSION_PATH_NOT_FOUND',
        missingPath: '$formValues.constructor.constructor',
        path: 'x-ui.visible',
      })]);
    });

    it('preserves custom resolver context while processValue supplies runtime values', () => {
      const customResolver = createCustomResolver(
        { externalContext: {}, formValues: {}, i18n: { title: 'T' } },
        { '$i18n': (path, resolverContext) => resolverContext.i18n[path] },
      );

      expect(processValue('{{ $i18n.title }}', customResolver, { externalContext: {}, formValues: {} })).toBe('T');
    });
  });
  describe('diagnostics as a side channel', () => {
    type Seen = Pick<ExpressionDiagnosticDetails, 'code' | 'missingPath'>;

    function setup(overrides: Partial<ResolverContext> = {}, strict = false) {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const seen: Seen[] = [];
      const context: ResolverContext = {
        externalContext: { user: { name: 'x', profile: null } },
        formValues: {},
        declaredFormPaths: new Set(['email', 'items']),
        ...overrides,
        diagnostics: createExpressionDiagnostics({
          onError: strict ? 'throw' : 'warn',
          onExpressionError: error => seen.push({
            code: error.code,
            ...(error.missingPath ? { missingPath: error.missingPath } : {}),
          }),
        }),
      };
      const run = (value: unknown, resolver = createDefaultResolver(context)) => processValue(value, resolver, context);
      return { context, run, seen };
    }

    const missing = (missingPath: string): Seen => ({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath });
    const unknown: Seen = { code: 'UNKNOWN_EXPRESSION_VARIABLE' };

    it('warns about optional $externalContext keys without changing the condition', () => {
      const { run, seen } = setup();

      expect(run('{{ $externalContext.user.isAdmin == true }}')).toBe(false);
      expect(run("{{ $externalContext.user.role != 'admin' }}")).toBe(true);
      expect(run("{{ $externalContext.user.nickname != 'x' }}")).toBe(true);
      expect(seen).toEqual([
        missing('$externalContext.user.isAdmin'),
        missing('$externalContext.user.role'),
        missing('$externalContext.user.nickname'),
      ]);
    });

    it('accepts a null guard over an optional $externalContext key', () => {
      const { run, seen } = setup();

      expect(run('{{ $externalContext.user.profile && $externalContext.user.profile.bio }}')).toBeNull();
      expect(run("{{ $externalContext.user.profile ? $externalContext.user.profile.bio : '' }}")).toBe('');
      expect(seen).toEqual([]);
    });

    it('never throws for a missing path below an existing $externalContext key', () => {
      const { run, seen } = setup({}, true);

      expect(run('{{ $externalContext.user.isAdmin == true }}')).toBe(false);
      expect(run('{{ $externalContext.user.isAdmin }}')).toBeUndefined();
      expect(seen).toEqual([missing('$externalContext.user.isAdmin'), missing('$externalContext.user.isAdmin')]);
      expect(() => run('{{ $externalContext.session.id }}')).toThrow(
        expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$externalContext.session.id' }),
      );
      expect(() => run('{{ $externalContext.session.id == 1 }}')).toThrow(ScheptaExpressionError);
    });

    it('reports typos and unknown roots anywhere in a ternary', () => {
      const { run, seen } = setup();

      expect(run("{{ $formValues.emial ? 'a' : 'b' }}")).toBe('b');
      expect(run("{{ $session.admin ? 'a' : 'b' }}")).toBe('b');
      expect(run("{{ $formValues.emial === 'x' ? 'a' : 'b' }}")).toBe('b');
      expect(run("{{ $formValues.email == 'x' ? $formValues.nmae : $session.id }}")).toBeUndefined();
      expect(seen).toEqual([
        missing('$formValues.emial'), unknown, missing('$formValues.emial'), missing('$formValues.nmae'), unknown,
      ]);
    });

    it('throws for ternary and bracket typos in strict mode with the diagnostic details', () => {
      const { run, seen } = setup({}, true);

      for (const expression of [
        "{{ $formValues.emial ? 'a' : 'b' }}",
        "{{ $formValues.emial === 'x' ? 'a' : 'b' }}",
        "{{ $formValues['emial'] == 1 }}",
        "{{ $formValues['emial'] }}",
      ]) {
        expect(() => run(expression)).toThrow(
          expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$formValues.emial' }),
        );
        // Strict mode throws every time, not only on the first report.
        expect(() => run(expression)).toThrow(ScheptaExpressionError);
      }
      expect(() => run("{{ $session.admin ? 'a' : 'b' }}")).toThrow(
        expect.objectContaining({ code: 'UNKNOWN_EXPRESSION_VARIABLE' }),
      );
      expect(seen).toHaveLength(5);
    });

    it('guards only the left operand of || and &&, and explicit null comparisons', () => {
      const { run, seen } = setup();

      expect(run("{{ $formValues.emial || 'fallback' }}")).toBe('fallback');
      expect(run('{{ $formValues.emial && $formValues.emial.length > 2 }}')).toBeUndefined();
      expect(run('{{ $formValues.emial == null }}')).toBe(true);
      expect(run('{{ $formValues.emial != undefined }}')).toBe(false);
      expect(seen).toEqual([]);

      expect(run("{{ 'fallback' || $formValues.emial }}")).toBe('fallback');
      expect(run('{{ !$formValues.emial }}')).toBe(true);
      expect(seen).toEqual([missing('$formValues.emial'), missing('$formValues.emial')]);
    });

    it('never lets a guard excuse an unknown root', () => {
      const { run, seen } = setup();

      expect(run("{{ $session.locale || 'en' }}")).toBe('en');
      expect(run('{{ $session.user && $session.user.id }}')).toBeUndefined();
      expect(run('{{ $session.user == null }}')).toBe(true);
      expect(run("{{ $formValues.email == admin }}")).toBe(true);
      expect(seen).toEqual([unknown, unknown, unknown, unknown]);
    });

    it('keeps resolving keys that contain operator characters, quietly', () => {
      const { run, seen } = setup({
        externalContext: { 'a/b': 7, 'x+y': 8, 'api-url': 'https://api' },
        formValues: { 'a-b': 5 },
        declaredFormPaths: new Set(['a-b', 'c-d']),
      }, true);

      expect(run('{{ $externalContext.a/b }}')).toBe(7);
      expect(run('{{ $externalContext.x+y }}')).toBe(8);
      expect(run('{{ $externalContext.api-url }}')).toBe('https://api');
      expect(run('URL: {{ $externalContext.api-url }}/v1')).toBe('URL: https://api/v1');
      expect(run('{{ $formValues.a-b }}')).toBe(5);
      // Declared, still empty, and never mistaken for a subtraction.
      expect(run('{{ $formValues.c-d }}')).toBeUndefined();
      expect(seen).toEqual([]);
    });

    it('does not turn a missing operator-character key into NaN', () => {
      const { run, seen } = setup({ externalContext: { a: 4 } });

      expect(run('{{ $externalContext.a/b }}')).toBeUndefined();
      expect(run('Rate: {{ $externalContext.a/b }}')).toBe('Rate: ');
      // `b` is not a variable; the same problem at the same place is reported once.
      expect(seen).toEqual([unknown]);
    });

    it('works with createCustomResolver roots', () => {
      const { context, run, seen } = setup({}, true);
      const resolver = createCustomResolver(context, {
        $i18n: path => `T(${path})`,
        $now: () => 'NOW',
        $optional: () => undefined,
      });

      expect(run('{{ $i18n.hello }}', resolver)).toBe('T(hello)');
      expect(run('Hi {{ $i18n.hello }} {{ $now }}', resolver)).toBe('Hi T(hello) NOW');
      expect(run('{{ $optional.anything }}', resolver)).toBeUndefined();
      // JEXL never saw custom roots, so the comparison keeps its historical value.
      expect(run("{{ $i18n.hello == 'T(hello)' }}", resolver)).toBe(false);
      expect(seen).toEqual([]);

      expect(() => run('{{ $i18n.hello }}')).toThrow(expect.objectContaining({ code: 'UNKNOWN_EXPRESSION_VARIABLE' }));
      expect(() => run('{{ $typo.hello }}', resolver)).toThrow(ScheptaExpressionError);
    });

    it('accepts array index and filter access in both spellings', () => {
      const { run, seen } = setup({ formValues: { items: [{ name: 'x', price: 2 }] } }, true);

      expect(run('{{ $formValues.items[0].name }}')).toBe('x');
      expect(run("{{ $formValues.items[0].name == 'x' }}")).toBe(true);
      expect(run('{{ $formValues.items[.price > 1][0].name }}')).toBe('x');
      expect(run('{{ $formValues.items[.price > 1] }}')).toEqual([{ name: 'x', price: 2 }]);
      expect(seen).toEqual([]);
    });

    it('stays quiet for an index into a declared array that is still empty', () => {
      const { run, seen } = setup({}, true);

      expect(run('{{ $formValues.items[0].name }}')).toBeUndefined();
      expect(run("{{ $formValues.items[0].name == 'x' }}")).toBeUndefined();
      expect(seen).toEqual([]);
      expect(() => run('{{ $formValues.itms[0].name }}')).toThrow(
        expect.objectContaining({ code: 'EXPRESSION_PATH_NOT_FOUND', missingPath: '$formValues.itms' }),
      );
    });

    it('reads get-only Proxy and class-instance contexts', () => {
      class Account {
        get fullName() { return 'Ada Lovelace'; }
      }
      const proxy = new Proxy({}, { get: (_, key) => `P:${String(key)}` });
      const { run, seen } = setup({ externalContext: { proxy, account: new Account() } }, true);

      expect(run('{{ $externalContext.proxy.anything }}')).toBe('P:anything');
      expect(run("{{ $externalContext.proxy.anything == 'P:anything' }}")).toBe(true);
      expect(run('{{ $externalContext.account.fullName }}')).toBe('Ada Lovelace');
      expect(run("{{ $externalContext.account.fullName == 'Ada Lovelace' }}")).toBe(true);
      expect(seen).toEqual([]);
    });

    it('accepts a group that contains declared fields', () => {
      const { run, seen } = setup({ declaredFormPaths: new Set(['userInfo.firstName']) }, true);

      expect(run('{{ $formValues.userInfo }}')).toBeUndefined();
      expect(run('{{ $formValues.userInfo.firstName.length > 2 }}')).toBe(false);
      expect(seen).toEqual([]);
    });

    it('forces undefined only for forbidden segments', () => {
      const { run, seen } = setup({ formValues: { email: 'a@b.c' } });

      expect(run('{{ $formValues.constructor.name }}')).toBeUndefined();
      expect(run("{{ $formValues['constructor'] }}")).toBeUndefined();
      expect(run("{{ $formValues.email.prototype || 'x' }}")).toBeUndefined();
      expect(seen).toEqual([
        missing('$formValues.constructor.name'),
        missing('$formValues.constructor'),
        missing('$formValues.email.prototype'),
      ]);
    });

    it('warns on the console when no diagnostics are configured, as before', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const context: ResolverContext = { externalContext: {}, formValues: {} };

      expect(processValue('{{ 1 === }}', createDefaultResolver(context), context)).toBeUndefined();
      expect(warn).toHaveBeenCalledWith('Error evaluating expression "1 ===":', expect.anything());
    });
  });
});
