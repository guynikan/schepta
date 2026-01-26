/**
 * Form Validator
 * 
 * Creates validation functions for Formik and native forms using AJV.
 * Equivalent to ajvResolver but for Formik and other form libraries.
 */

import Ajv, { ErrorObject } from 'ajv';
import addErrors from 'ajv-errors';
import type { FormSchema } from '../schema/schema-types';
import { generateValidationSchema, type SchemaParserOptions } from './schema-parser';

/**
 * Formik-compatible validation errors object
 */
export interface FormikValidationErrors {
  [field: string]: string;
}

/**
 * Generic form validation result
 */
export interface FormValidationResult {
  valid: boolean;
  errors: FormikValidationErrors;
}

/**
 * Parse AJV errors into Formik-compatible format
 * 
 * @param ajvErrors - Array of AJV error objects
 * @returns Formik-compatible errors object with nested paths (e.g., 'personalInfo.firstName')
 */
function parseAjvErrors(ajvErrors: ErrorObject[] | null | undefined): FormikValidationErrors {
  if (!ajvErrors || ajvErrors.length === 0) {
    return {};
  }
  
  const errors: FormikValidationErrors = {};
  
  for (const error of ajvErrors) {
    // Get the base path from instancePath
    let path = error.instancePath;
    
    // Handle required errors - AJV returns the parent path, we need to append the missing property
    if (error.keyword === 'required' && error.params.missingProperty) {
      path = path ? `${path}/${error.params.missingProperty}` : `/${error.params.missingProperty}`;
    }
    
    // Convert JSON pointer path to dot notation: /personalInfo/firstName -> personalInfo.firstName
    const fieldPath = path.startsWith('/') ? path.substring(1) : path;
    const normalizedPath = fieldPath.replace(/\//g, '.');
    
    // Only set if not already set (first error takes precedence)
    if (normalizedPath && !errors[normalizedPath] && error.message) {
      errors[normalizedPath] = error.message;
    }
  }
  
  return errors;
}

/**
 * Creates a validate function for Formik using AJV.
 * This is equivalent to ajvResolver but returns a Formik-compatible validate function.
 * 
 * @param schema - The FormSchema to validate against
 * @param options - Parser options for i18n and customization
 * @returns A validate function compatible with Formik's validate prop
 * 
 * @example
 * ```typescript
 * import { Formik } from 'formik';
 * import { generateValidationSchema, createFormikValidator } from '@schepta/core';
 * 
 * const { initialValues } = generateValidationSchema(formSchema);
 * const validate = createFormikValidator(formSchema, { locale: 'pt' });
 * 
 * <Formik
 *   initialValues={initialValues}
 *   validate={validate}
 *   onSubmit={handleSubmit}
 * >
 *   {({ errors }) => (
 *     // form content
 *   )}
 * </Formik>
 * ```
 */
export function createFormikValidator(
  schema: FormSchema,
  options?: SchemaParserOptions
): (values: Record<string, any>) => FormikValidationErrors {
  // Generate JSON Schema from FormSchema
  const { jsonSchema } = generateValidationSchema(schema, options);
  
  // Create AJV instance with custom error messages support
  const ajv = new Ajv({
    allErrors: true,
    validateSchema: true,
    strict: false,
  });
  
  // Add error message support
  addErrors(ajv);
  
  // Compile the schema
  const validate = ajv.compile(jsonSchema);
  
  // Return the validation function
  return (values: Record<string, any>): FormikValidationErrors => {
    const valid = validate(values);
    
    if (valid) {
      return {};
    }
    
    return parseAjvErrors(validate.errors);
  };
}

/**
 * Creates a generic form validator that returns both validation status and errors.
 * Can be used with native forms or any custom form implementation.
 * 
 * @param schema - The FormSchema to validate against
 * @param options - Parser options for i18n and customization
 * @returns A validate function that returns { valid, errors }
 * 
 * @example
 * ```typescript
 * const validate = createFormValidator(formSchema);
 * 
 * const handleSubmit = (e) => {
 *   const formData = new FormData(e.target);
 *   const values = Object.fromEntries(formData);
 *   const { valid, errors } = validate(values);
 *   
 *   if (!valid) {
 *     console.error('Validation errors:', errors);
 *     return;
 *   }
 *   
 *   // Submit form
 * };
 * ```
 */
export function createFormValidator(
  schema: FormSchema,
  options?: SchemaParserOptions
): (values: Record<string, any>) => FormValidationResult {
  const formikValidator = createFormikValidator(schema, options);
  
  return (values: Record<string, any>): FormValidationResult => {
    const errors = formikValidator(values);
    const valid = Object.keys(errors).length === 0;
    
    return { valid, errors };
  };
}
