/**
 * useSchemaValidation Hook
 * 
 * Validates form schema instances before rendering.
 */

import { useMemo } from 'react';
import type { FormSchema } from '@schepta/core';
import {
  createSchemaValidator,
  formatValidationErrors,
  type ValidationResult,
} from '@schepta/core';

export interface SchemaValidationOptions {
  /** The JSON Schema to validate against */
  formSchema: object;
  /** Whether to throw an error on validation failure */
  throwOnError?: boolean;
}

export interface SchemaValidationResult extends ValidationResult {
  /** Formatted error message for logging */
  formattedErrors: string;
}

/**
 * Hook to validate a form instance against a schema
 * 
 * @param instance - The form instance to validate
 * @param options - Validation options
 * @returns Validation result with errors if any
 * 
 * @example
 * ```tsx
 * const { valid, errors, formattedErrors } = useSchemaValidation(schema, {
 *   formSchema: formSchemaDefinition,
 *   enabled: process.env.NODE_ENV === 'development',
 * });
 * 
 * if (!valid) {
 *   console.error('Schema validation failed:', formattedErrors);
 * }
 * ```
 */
export function useSchemaValidation(
  instance: FormSchema,
  options: SchemaValidationOptions
): SchemaValidationResult {
  const { formSchema, throwOnError = false } = options;

  return useMemo(() => {

    try {
      const validator = createSchemaValidator(formSchema, { throwOnError });
      const result = validator(instance);

      // Log errors in development
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
      // If schema compilation fails, return that error
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
  }, [instance, formSchema, throwOnError]);
}

