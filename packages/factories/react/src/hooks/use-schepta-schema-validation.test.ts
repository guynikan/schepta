/**
 * useScheptaSchemaValidation hook tests
 *
 * Validates that the generic schema-validation hook works against arbitrary
 * JSON Schema definitions (not tied to forms).
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScheptaSchemaValidation } from './use-schepta-schema-validation';

const arbitrarySchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['name', 'items'],
  properties: {
    name: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          value: { type: 'number' },
        },
      },
    },
  },
};

describe('useScheptaSchemaValidation', () => {
  it('returns valid=true for an instance that matches the schema', () => {
    const instance = {
      name: 'demo',
      items: [{ id: 'a', value: 1 }],
    };

    const { result } = renderHook(() =>
      useScheptaSchemaValidation(instance, { schemaDefinition: arbitrarySchema })
    );

    expect(result.current.valid).toBe(true);
    expect(result.current.formattedErrors).toBe('');
  });

  it('reports errors with a formatted message for an invalid instance', () => {
    const instance = {
      items: [{ value: 2 }],
    };

    const { result } = renderHook(() =>
      useScheptaSchemaValidation(instance, { schemaDefinition: arbitrarySchema })
    );

    expect(result.current.valid).toBe(false);
    expect(result.current.errors?.length).toBeGreaterThan(0);
    expect(result.current.formattedErrors.length).toBeGreaterThan(0);
  });

  it('handles malformed schema compilation gracefully', () => {
    const brokenSchema: any = {
      type: 'object',
      properties: null, // AJV cannot compile this
    };

    const { result } = renderHook(() =>
      useScheptaSchemaValidation({}, { schemaDefinition: brokenSchema })
    );

    expect(result.current.valid).toBe(false);
    expect(result.current.formattedErrors).toMatch(/compilation error/i);
  });
});
