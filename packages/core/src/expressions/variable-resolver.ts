/**
 * Variable Resolver
 * 
 * Framework-agnostic variable resolution for template expressions
 * Extensible for future use with JEXL and other expression engines
 */

import type { ExpressionDiagnostics } from './diagnostics';

/**
 * Context for variable resolution
 */
export interface ResolverContext {
  /** External context (user data, API services, etc.) */
  externalContext: Record<string, any>;
  /** Form values (current form values) */
  formValues: Record<string, any>;
  /** Schema-declared form paths. Undefined values at these paths are valid. */
  declaredFormPaths?: ReadonlySet<string>;
  /** Location of the schema value currently being resolved. */
  expressionPath?: string;
  diagnostics?: ExpressionDiagnostics;
  /** Additional context variables (extensible) */
  [key: string]: any;
}

/**
 * Variable resolver function
 * Resolves a variable expression to its value
 * 
 * @param expression Variable expression (e.g., "$externalContext.user.name")
 * @returns Resolved value or undefined if not found
 * 
 * Note: The context is captured in the closure when creating the resolver
 */
export interface VariableResolver {
  (expression: string): any;
  /**
   * Tells diagnostics that a custom handler owns this expression or root
   * variable, so it is neither unknown nor checked against the form schema.
   */
  handles?: (expression: string) => boolean;
}

/** Property names which must never be followed from a schema expression. */
export const UNSAFE_PATH_SEGMENTS: ReadonlySet<string> = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Resolve a nested property path (e.g., "user.name" -> context.user.name)
 * 
 * @param path Property path (e.g., "user.name")
 * @param obj Object to traverse
 * @returns Resolved value or undefined
 */
function resolveNestedPath(path: string, obj: any): any {
  if (!path || !obj) {
    return undefined;
  }

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (UNSAFE_PATH_SEGMENTS.has(part)) {
      return undefined;
    }
    // Plain read: getters, class instances and get-only Proxies must keep working.
    current = current[part];
  }

  return current;
}

/**
 * Create default variable resolver
 * Supports:
 * - $externalContext.* - values from externalContext
 * - $formValues.* - values from formValues
 * 
 * @param context Resolver context
 * @returns Variable resolver function
 * 
 * @example
 * const resolver = createDefaultResolver({
 *   externalContext: { user: { name: "John" } },
 *   formValues: { email: "john@example.com" }
 * });
 * resolver("$externalContext.user.name") // "John"
 * resolver("$formValues.email") // "john@example.com"
 */
export function createDefaultResolver(context: ResolverContext): VariableResolver {
  return (expression: string): any => {
    if (!expression || typeof expression !== 'string') {
      return undefined;
    }

    const trimmed = expression.trim();

    // Handle $externalContext.*
    if (trimmed.startsWith('$externalContext.')) {
      const path = trimmed.substring('$externalContext.'.length);
      return resolveNestedPath(path, context.externalContext);
    }

    // Handle $formValues.*
    if (trimmed.startsWith('$formValues.')) {
      const path = trimmed.substring('$formValues.'.length);
      return resolveNestedPath(path, context.formValues);
    }

    // Handle $externalContext (without path - returns entire object)
    if (trimmed === '$externalContext') {
      return context.externalContext;
    }

    // Handle $formValues (without path - returns entire object)
    if (trimmed === '$formValues') {
      return context.formValues;
    }

    // Future: support other variables like $i18n, $now, etc.
    // This can be extended by custom resolvers

    return undefined;
  };
}

/**
 * Create a custom variable resolver
 * Allows extending the default resolver with custom variable handlers
 * 
 * @param context Resolver context
 * @param customHandlers Map of variable prefixes to resolver functions
 * @returns Variable resolver function
 * 
 * @example
 * const resolver = createCustomResolver(context, {
 *   '$i18n': (path, ctx) => ctx.i18n[path],
 *   '$now': () => new Date()
 * });
 */
export function createCustomResolver(
  context: ResolverContext,
  customHandlers: Record<string, (path: string, ctx: ResolverContext) => any>
): VariableResolver {
  const defaultResolver = createDefaultResolver(context);
  const prefixes = Object.keys(customHandlers);

  const resolver: VariableResolver = (expression: string): any => {
    if (!expression || typeof expression !== 'string') {
      return undefined;
    }

    const trimmed = expression.trim();

    // Check custom handlers first
    for (const [prefix, handler] of Object.entries(customHandlers)) {
      if (trimmed.startsWith(prefix)) {
        const path = trimmed.substring(prefix.length);
        // Remove leading dot if present
        const cleanPath = path.startsWith('.') ? path.substring(1) : path;
        return handler(cleanPath, context);
      }
    }

    // Fall back to default resolver
    return defaultResolver(expression);
  };
  resolver.handles = expression => prefixes.some(prefix => expression.trim().startsWith(prefix));

  return resolver;
}
