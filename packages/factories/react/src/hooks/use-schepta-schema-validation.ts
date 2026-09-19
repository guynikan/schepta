/**
 * useScheptaSchemaValidation Hook
 *
 * Validates a schema instance against a supplied JSON Schema. Framework-
 * agnostic by design — works for any Schepta factory (form, menu, stepper).
 */

import { useMemo } from 'react';
import {
  createSchemaValidator,
  formatValidationErrors,
  type ValidationResult,
} from '@schepta/core';

export interface ScheptaSchemaValidationOptions {
  /** The JSON Schema definition to validate against (AJV-compatible) */
  schemaDefinition: object;
  /** Whether to throw an error on validation failure */
  throwOnError?: boolean;
}

export interface ScheptaSchemaValidationResult extends ValidationResult {
  /** Formatted error message for logging */
  formattedErrors: string;
}

/**
 * Validates an arbitrary schema instance against a JSON Schema definition.
 *
 * @param instance - The schema instance to validate
 * @param options - Validation options
 * @returns Validation result with errors if any
 *
 * @example
 * ```tsx
 * const { valid, errors, formattedErrors } = useScheptaSchemaValidation(schema, {
 *   schemaDefinition: formSchemaDefinition,
 * });
 *
 * if (!valid) {
 *   console.error('Schema validation failed:', formattedErrors);
 * }
 * ```
 */
export function useScheptaSchemaValidation(
  instance: unknown,
  options: ScheptaSchemaValidationOptions
): ScheptaSchemaValidationResult {
  const { schemaDefinition, throwOnError = false } = options;

  return useMemo(() => {
    try {
      const validator = createSchemaValidator(schemaDefinition, { throwOnError });
      const result = validator(instance as any);

      if (!result.valid && typeof window !== 'undefined') {
        const formattedErrors = formatValidationErrors(result.errors);
        console.error(
          '%c[Schepta] Schema Validation Failed',
          'color: #ff4444; font-weight: bold;'
        );
        console.error(formattedErrors);
      }

      return {
        ...result,
        formattedErrors: result.valid ? '' : formatValidationErrors(result.errors),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: `Schema compilation error: ${errorMessage}`,
            keyword: 'schema',
            params: {},
          },
        ],
        formattedErrors: `Schema compilation error: ${errorMessage}`,
      };
    }
  }, [instance, schemaDefinition, throwOnError]);
}
