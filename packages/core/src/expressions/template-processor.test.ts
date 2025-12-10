/**
 * Template Processor Tests
 */

import { describe, it, expect } from 'vitest';
import {
  processTemplateString,
  processTemplateExpression,
  processValue,
  needsProcessing,
} from './template-processor';
import { createDefaultResolver, type ResolverContext } from './variable-resolver';

describe('Template Processor', () => {
  const context: ResolverContext = {
    externalContext: {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      api: 'https://api.example.com',
    },
    formState: {
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
        context
      );
      expect(result).toBe('Hello John Doe');
    });

    it('should replace multiple template expressions', () => {
      const result = processTemplateString(
        '{{ $externalContext.user.name }} - {{ $formValues.firstName }}',
        resolver,
        context
      );
      expect(result).toBe('John Doe - John');
    });

    it('should handle strings without templates', () => {
      const result = processTemplateString(
        'Hello world',
        resolver,
        context
      );
      expect(result).toBe('Hello world');
    });

    it('should replace with empty string if value is undefined', () => {
      const result = processTemplateString(
        'Hello {{ $externalContext.nonexistent }}',
        resolver,
        context
      );
      expect(result).toBe('Hello ');
    });

    it('should convert non-string values to string', () => {
      const customContext: ResolverContext = {
        externalContext: { count: 42 },
        formState: {},
      };
      const customResolver = createDefaultResolver(customContext);
      
      const result = processTemplateString(
        'Count: {{ $externalContext.count }}',
        customResolver,
        customContext
      );
      expect(result).toBe('Count: 42');
    });
  });

  describe('processTemplateExpression', () => {
    it('should resolve expression directly', () => {
      const result = processTemplateExpression(
        '$externalContext.user.name',
        resolver,
        context
      );
      expect(result).toBe('John Doe');
    });

    it('should return undefined for unknown expressions', () => {
      const result = processTemplateExpression(
        '$externalContext.nonexistent',
        resolver,
        context
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
});

