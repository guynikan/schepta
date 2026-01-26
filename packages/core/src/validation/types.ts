/**
 * Validation Types
 * 
 * Type definitions for schema validation system.
 * 
 * This module contains types for:
 * - Schema structure validation (development-time validation of FormSchema JSON)
 * - Form data validation (runtime validation of user input)
 */

// ============================================================================
// Schema Structure Validation Types (development-time)
// Used by schema-validator.ts for validating FormSchema JSON is well-formed
// ============================================================================

/**
 * Represents a single validation error from schema structure validation
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
 * Result of schema structure validation
 */
export interface ValidationResult {
  /** Whether the instance is valid against the schema */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Options for schema structure validation
 */
export interface ValidationOptions {
  /** Whether to collect all errors or stop at the first one */
  allErrors?: boolean;
  /** Whether to include verbose error information */
  verbose?: boolean;
  /** Whether to throw an error if validation fails */
  throwOnError?: boolean;
}

// ============================================================================
// Form Data Validation Types (runtime)
// Re-exported from schema-traversal.ts, schema-parser.ts, and form-validator.ts
// ============================================================================

// Re-export types from schema-traversal
export type { FieldNode, FieldVisitor } from './schema-traversal';

// Re-export types from schema-parser
export type { 
  ValidationMessages, 
  ParsedSchema, 
  SchemaParserOptions 
} from './schema-parser';

// Re-export types from form-validator
export type { 
  FormikValidationErrors, 
  FormValidationResult 
} from './form-validator';
