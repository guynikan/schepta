/**
 * Template Processor
 * 
 * Framework-agnostic processing of template expressions
 * Recursively processes values (strings, objects, arrays) and replaces templates
 * Uses JEXL for complex expressions with operators (===, !==, &&, ||, etc.)
 */

import jexl from 'jexl';
import { detectTemplateExpressions, hasTemplateExpressions } from './template-detector';
import type { VariableResolver, ResolverContext } from './variable-resolver';

/**
 * Check if an expression contains operators (is a complex expression)
 * Complex expressions need JEXL evaluation instead of simple variable resolution
 * 
 * @param expr Expression to check
 * @returns true if expression contains operators
 */
function isComplexExpression(expr: string): boolean {
  // Contains comparison or logical operators
  return /===|!==|==|!=|>=|<=|>|<|&&|\|\|/.test(expr);
}

/**
 * Convert JavaScript operators to JEXL operators
 * JEXL uses == instead of ===, and != instead of !==
 * 
 * @param expression Expression with JS operators
 * @returns Expression with JEXL operators
 */
function convertToJexlOperators(expression: string): string {
  return expression
    .replace(/===/g, '==')
    .replace(/!==/g, '!=');
}

/**
 * Evaluate a complex expression using JEXL
 * 
 * @param expression Expression to evaluate
 * @param context Resolver context with formValues and externalContext
 * @returns Evaluated result (boolean, number, string, etc.)
 */
function evaluateExpression(expression: string, context: ResolverContext): any {
  // Build JEXL context with form values and external context
  const jexlContext = {
    $formValues: context.formValues,
    $externalContext: context.externalContext,
  };
  
  // Convert JS operators to JEXL operators
  const jexlExpression = convertToJexlOperators(expression);
  
  try {
    return jexl.evalSync(jexlExpression, jexlContext);
  } catch (error) {
    console.warn(`Error evaluating expression "${expression}":`, error);
    return undefined;
  }
}

/**
 * Process a single template expression in a string
 * Replaces all {{ }} expressions with resolved values
 * Uses JEXL for complex expressions with operators
 * 
 * @param str String containing template expressions
 * @param resolver Variable resolver function
 * @param context Resolver context (required for JEXL evaluation)
 * @returns Processed value - preserves type for single expressions (boolean, number), string for interpolated
 * 
 * @example Simple variable
 * processTemplateString("Hello {{ $externalContext.user.name }}", resolver, context)
 * // Returns: "Hello John"
 * 
 * @example Boolean expression (returns boolean, not string)
 * processTemplateString("{{ $formValues.status === 'active' }}", resolver, context)
 * // Returns: true (boolean)
 */
export function processTemplateString(
  str: string,
  resolver: VariableResolver,
  context: ResolverContext
): any {
  if (typeof str !== 'string') {
    return str;
  }

  // Find all template expressions
  const expressions = detectTemplateExpressions(str);
  
  if (expressions.length === 0) {
    return str;
  }

  // Check if string is EXACTLY a single template (no surrounding text)
  // This allows preserving the type (boolean, number) instead of converting to string
  const singleTemplateMatch = str.match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (singleTemplateMatch) {
    const expr = singleTemplateMatch[1].trim();
    
    // Complex expressions (with operators) need JEXL evaluation
    if (isComplexExpression(expr)) {
      return evaluateExpression(expr, context);
    }
    
    // Simple variable resolution - return value directly (preserves type)
    return resolver(expr);
  }

  // Multiple templates or text around them: concatenate as string
  let result = str;

  for (const expression of expressions) {
    const template = `{{ ${expression} }}`;
    let resolved: any;
    
    // Use JEXL for complex expressions
    if (isComplexExpression(expression)) {
      resolved = evaluateExpression(expression, context);
    } else {
      resolved = resolver(expression);
    }
    
    // Convert to string for concatenation
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
 * Uses JEXL for complex expressions with operators
 * 
 * @param value Value to process (can be any type)
 * @param resolver Variable resolver function
 * @param context Resolver context (required for JEXL evaluation)
 * @returns Processed value with templates replaced
 * 
 * @example
 * processValue({
 *   label: "{{ $externalContext.user.name }}",
 *   nested: {
 *     placeholder: "Enter {{ $formValues.email }}"
 *   },
 *   disabled: "{{ $formValues.status === 'inactive' }}"
 * }, resolver, context)
 * // Returns: {
 * //   label: "John",
 * //   nested: {
 * //     placeholder: "Enter john@example.com"
 * //   },
 * //   disabled: true (boolean, not string)
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

  // Handle strings - process template expressions (pass context for JEXL)
  if (typeof value === 'string') {
    return processTemplateString(value, resolver, context);
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

