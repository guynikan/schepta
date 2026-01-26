/**
 * Validation Module
 * 
 * This module provides two types of validation:
 * 
 * 1. Schema Structure Validation (development-time)
 *    - Validates that FormSchema JSON is well-formed
 *    - Uses schema-validator.ts
 * 
 * 2. Form Data Validation (runtime)
 *    - Validates user input against rules in x-component-props
 *    - Uses schema-parser.ts, form-validator.ts
 *    - Compatible with ajvResolver, Formik, and native forms
 */

// Types
export * from './types';

// Schema structure validation (development-time)
export * from './schema-validator';

// Schema traversal utilities (shared)
export * from './schema-traversal';

// Form data validation (runtime)
export * from './schema-parser';
export * from './form-validator';
