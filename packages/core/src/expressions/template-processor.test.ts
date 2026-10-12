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

    it('leaves invalid conditions at their safe undefined defaults and reports each location', () => {
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

    it('preserves custom resolver context while processValue supplies runtime values', () => {
      const customResolver = createCustomResolver(
        { externalContext: {}, formValues: {}, i18n: { title: 'T' } },
        { '$i18n': (path, resolverContext) => resolverContext.i18n[path] },
      );

      expect(processValue('{{ $i18n.title }}', customResolver, { externalContext: {}, formValues: {} })).toBe('T');
    });
  });
});

