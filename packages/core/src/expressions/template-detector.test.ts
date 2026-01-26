/**
 * Template Detector Tests
 */

import { describe, it, expect } from 'vitest';
import {
  detectTemplateExpressions,
  extractExpression,
  hasTemplateExpressions,
  getAllTemplateExpressions,
} from './template-detector';

describe('Template Detector', () => {
  describe('detectTemplateExpressions', () => {
    it('should detect single template expression', () => {
      const str = 'Hello {{ $externalContext.user.name }}';
      const result = detectTemplateExpressions(str);
      expect(result).toEqual(['$externalContext.user.name']);
    });

    it('should detect multiple template expressions', () => {
      const str = '{{ $externalContext.user.name }} and {{ $formValues.email }}';
      const result = detectTemplateExpressions(str);
      expect(result).toEqual(['$externalContext.user.name', '$formValues.email']);
    });

    it('should handle whitespace in templates', () => {
      const str = '{{  $externalContext.user.name  }}';
      const result = detectTemplateExpressions(str);
      expect(result).toEqual(['$externalContext.user.name']);
    });

    it('should return empty array for strings without templates', () => {
      const str = 'Hello world';
      const result = detectTemplateExpressions(str);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-string values', () => {
      expect(detectTemplateExpressions(null as any)).toEqual([]);
      expect(detectTemplateExpressions(undefined as any)).toEqual([]);
      expect(detectTemplateExpressions(123 as any)).toEqual([]);
    });
  });

  describe('extractExpression', () => {
    it('should extract expression from template', () => {
      const result = extractExpression('{{ $externalContext.user.name }}');
      expect(result).toBe('$externalContext.user.name');
    });

    it('should handle whitespace', () => {
      const result = extractExpression('{{  $formValues.email  }}');
      expect(result).toBe('$formValues.email');
    });

    it('should return original string if no template found', () => {
      const result = extractExpression('no template');
      expect(result).toBe('no template');
    });
  });

  describe('hasTemplateExpressions', () => {
    it('should detect templates in strings', () => {
      expect(hasTemplateExpressions('{{ $externalContext.user.name }}')).toBe(true);
      expect(hasTemplateExpressions('Hello world')).toBe(false);
    });

    it('should detect templates in objects recursively', () => {
      expect(hasTemplateExpressions({
        label: '{{ $externalContext.user.name }}',
        placeholder: 'static',
      })).toBe(true);

      expect(hasTemplateExpressions({
        label: 'static',
        placeholder: 'static',
      })).toBe(false);
    });

    it('should detect templates in arrays recursively', () => {
      expect(hasTemplateExpressions([
        '{{ $externalContext.api }}',
        'static',
      ])).toBe(true);

      expect(hasTemplateExpressions(['static', 'text'])).toBe(false);
    });

    it('should detect templates in nested structures', () => {
      expect(hasTemplateExpressions({
        ui: {
          label: '{{ $externalContext.user.name }}',
          nested: {
            placeholder: 'static',
          },
        },
      })).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(hasTemplateExpressions(null)).toBe(false);
      expect(hasTemplateExpressions(undefined)).toBe(false);
    });
  });

  describe('getAllTemplateExpressions', () => {
    it('should extract all unique expressions from a value', () => {
      const value = {
        label: '{{ $externalContext.user.name }}',
        placeholder: 'Enter {{ $externalContext.fieldName }}',
        nested: {
          text: '{{ $formValues.email }}',
        },
      };

      const result = getAllTemplateExpressions(value);
      expect(result).toHaveLength(3);
      expect(result).toContain('$externalContext.user.name');
      expect(result).toContain('$externalContext.fieldName');
      expect(result).toContain('$formValues.email');
    });

    it('should return unique expressions only', () => {
      const value = {
        label: '{{ $externalContext.user.name }}',
        title: '{{ $externalContext.user.name }}',
      };

      const result = getAllTemplateExpressions(value);
      expect(result).toEqual(['$externalContext.user.name']);
    });
  });
});

