/**
 * Schema Validator
 * 
 * JSON Schema validation using AJV with detailed error reporting.
 */

import Ajv, { ErrorObject } from 'ajv';
import addErrors from 'ajv-errors';
import type { ValidationError, ValidationResult, ValidationOptions } from './types';

/**
 * Generate a suggestion for fixing a validation error
 */
function generateSuggestion(error: ErrorObject): string | undefined {
  switch (error.keyword) {
    case 'required':
      return `Add the missing required property: "${error.params.missingProperty}"`;
    
    case 'type':
      return `Change the value type to "${error.params.type}"`;
    
    case 'const':
      return `Value must be exactly: ${JSON.stringify(error.params.allowedValue)}`;
    
    case 'enum':
      return `Value must be one of: ${error.params.allowedValues?.join(', ')}`;
    
    case 'additionalProperties':
      return `Remove unexpected property: "${error.params.additionalProperty}"`;
    
    case 'minProperties':
      return `Object must have at least ${error.params.limit} properties`;
    
    case 'maxProperties':
      return `Object must have at most ${error.params.limit} properties`;
    
    case 'pattern':
      return `Value must match pattern: ${error.params.pattern}`;
    
    case 'oneOf':
      return 'Value must match exactly one of the allowed schemas';
    
    case 'anyOf':
      return 'Value must match at least one of the allowed schemas';
    
    default:
      return undefined;
  }
}

/**
 * Transform AJV errors into ValidationError format
 */
function transformErrors(errors: ErrorObject[] | null | undefined): ValidationError[] {
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map(err => ({
    path: err.instancePath || '/',
    message: err.message || 'Unknown validation error',
    keyword: err.keyword,
    params: err.params || {},
    suggestion: generateSuggestion(err),
    schemaPath: err.schemaPath,
  }));
}

/**
 * Create a schema validator function
 * 
 * @param schema - The JSON Schema to validate against
 * @param options - Validation options
 * @returns A validation function that can be called with instances
 * 
 * @example
 * ```typescript
 * const validator = createSchemaValidator(formSchema);
 * const result = validator(formInstance);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function createSchemaValidator(
  schema: object,
  options: ValidationOptions = {}
) {
  const { allErrors = true, verbose = true } = options;

  const ajv = new Ajv({
    allErrors,
    verbose,
    strict: false, // Allow unknown formats and keywords
  });
  
  // Add better error messages support
  addErrors(ajv);

  const validate = ajv.compile(schema);

  return (instance: unknown): ValidationResult => {
    const valid = validate(instance);

    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = transformErrors(validate.errors);

    if (options.throwOnError) {
      const errorMessage = errors
        .map(e => `${e.path}: ${e.message}`)
        .join('\n');
      throw new Error(`Schema validation failed:\n${errorMessage}`);
    }

    return { valid: false, errors };
  };
}

/**
 * Format validation errors for console output
 * 
 * @param errors - Array of validation errors
 * @returns Formatted string for logging
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }

  return errors
    .map((error, index) => {
      const lines = [
        `Error ${index + 1}:`,
        `  Path: ${error.path}`,
        `  Message: ${error.message}`,
        `  Keyword: ${error.keyword}`,
      ];

      if (error.suggestion) {
        lines.push(`  Suggestion: ${error.suggestion}`);
      }

      return lines.join('\n');
    })
    .join('\n\n');
}

/**
 * Pre-compiled validator for form schemas
 * This will be populated when validateFormSchema is called with a schema
 */
let formSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null;

/**
 * Set the form schema for validation
 * Call this once during app initialization with your form schema
 * 
 * @param schema - The form schema definition
 */
export function setFormSchema(schema: object): void {
  formSchemaValidator = createSchemaValidator(schema);
}

/**
 * Validate a form instance against the form schema
 * 
 * @param instance - The form instance to validate
 * @param schema - Optional schema to use (if not using setFormSchema)
 * @returns Validation result with errors if any
 */
export function validateFormInstance(
  instance: unknown,
  schema?: object
): ValidationResult {
  if (schema) {
    const validator = createSchemaValidator(schema);
    return validator(instance);
  }

  if (!formSchemaValidator) {
    console.warn(
      'Form schema not set. Call setFormSchema() first or pass schema as parameter.'
    );
    return { valid: true, errors: [] };
  }

  return formSchemaValidator(instance);
}

