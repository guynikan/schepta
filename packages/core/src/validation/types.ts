/**
 * Validation Types
 * 
 * Type definitions for schema validation system.
 */

/**
 * Represents a single validation error
 */
export interface ValidationError {
  /** JSON pointer path to the error location (e.g., "/properties/personalInfo/properties/firstName") */
  path: string;
  /** Human-readable error message */
  message: string;
  /** AJV keyword that triggered the error (required, type, const, etc.) */
  keyword: string;
  /** Additional parameters from AJV error */
  params: Record<string, any>;
  /** Optional suggestion for how to fix the error */
  suggestion?: string;
  /** The schema path where the error was defined */
  schemaPath?: string;
}

/**
 * Result of schema validation
 */
export interface ValidationResult {
  /** Whether the instance is valid against the schema */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Options for schema validation
 */
export interface ValidationOptions {
  /** Whether to collect all errors or stop at the first one */
  allErrors?: boolean;
  /** Whether to include verbose error information */
  verbose?: boolean;
  /** Whether to throw an error if validation fails */
  throwOnError?: boolean;
}

