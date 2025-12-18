/**
 * Template Processor
 * 
 * Framework-agnostic processing of template expressions
 * Recursively processes values (strings, objects, arrays) and replaces templates
 */

import { detectTemplateExpressions, hasTemplateExpressions } from './template-detector';
import type { VariableResolver, ResolverContext } from './variable-resolver';

/**
 * Process a single template expression in a string
 * Replaces all {{ }} expressions with resolved values
 * 
 * @param str String containing template expressions
 * @param resolver Variable resolver function
 * @param context Resolver context
 * @returns String with templates replaced
 * 
 * @example
 * processTemplateString(
 *   "Hello {{ $externalContext.user.name }}",
 *   resolver,
 *   context
 * )
 * // Returns: "Hello John"
 */
export function processTemplateString(
  str: string,
  resolver: VariableResolver,
): string {
  if (typeof str !== 'string') {
    return str;
  }

  // Find all template expressions
  const expressions = detectTemplateExpressions(str);
  
  if (expressions.length === 0) {
    return str;
  }

  let result = str;

  // Replace each expression with its resolved value
  for (const expression of expressions) {
    const resolved = resolver(expression);
    const template = `{{ ${expression} }}`;
    
    // Replace template with resolved value (convert to string if needed)
    const replacement = resolved !== undefined && resolved !== null 
      ? String(resolved) 
      : '';
    
    result = result.replace(template, replacement);
  }

  return result;
}

/**
 * Process a single template expression (returns the resolved value directly)
 * 
 * @param expression Template expression (e.g., "$externalContext.user.name")
 * @param resolver Variable resolver function
 * @param context Resolver context
 * @returns Resolved value
 * 
 * @example
 * processTemplateExpression("$externalContext.user.name", resolver, context)
 * // Returns: "John"
 */
export function processTemplateExpression(
  expression: string,
  resolver: VariableResolver,
): any {
  return resolver(expression);
}

/**
 * Process a value recursively, replacing all template expressions
 * Handles strings, objects, arrays, and nested structures
 * 
 * @param value Value to process (can be any type)
 * @param resolver Variable resolver function
 * @param context Resolver context
 * @returns Processed value with templates replaced
 * 
 * @example
 * processValue({
 *   label: "{{ $externalContext.user.name }}",
 *   nested: {
 *     placeholder: "Enter {{ $formState.email }}"
 *   }
 * }, resolver, context)
 * // Returns: {
 * //   label: "John",
 * //   nested: {
 * //     placeholder: "Enter john@example.com"
 * //   }
 * // }
 */
export function processValue(
  value: any,
  resolver: VariableResolver,
  context: ResolverContext
): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle strings - process template expressions
  if (typeof value === 'string') {
    return processTemplateString(value, resolver);
  }

  // Handle arrays - process each element recursively
  if (Array.isArray(value)) {
    return value.map(item => processValue(item, resolver, context));
  }

  // Handle objects - process each property recursively
  if (typeof value === 'object') {
    const processed: Record<string, any> = {};
    
    for (const [key, val] of Object.entries(value)) {
      processed[key] = processValue(val, resolver, context);
    }
    
    return processed;
  }

  // Handle primitives (numbers, booleans, etc.) - return as-is
  return value;
}

/**
 * Check if processing is needed (optimization)
 * 
 * @param value Value to check
 * @returns true if value contains templates that need processing
 */
export function needsProcessing(value: any): boolean {
  return hasTemplateExpressions(value);
}

