/**
 * Variable Resolver
 * 
 * Framework-agnostic variable resolution for template expressions
 * Extensible for future use with JEXL and other expression engines
 */

/**
 * Context for variable resolution
 */
export interface ResolverContext {
  /** External context (user data, API services, etc.) */
  externalContext: Record<string, any>;
  /** Form state (current form values) */
  formState: Record<string, any>;
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
export type VariableResolver = (expression: string) => any;

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
    // if (current === null || current === undefined) {
    //   return undefined;
    // }
    current = current[part];
  }

  return current;
}

/**
 * Create default variable resolver
 * Supports:
 * - $externalContext.* - values from externalContext
 * - $formState.* - values from formState
 * 
 * @param context Resolver context
 * @returns Variable resolver function
 * 
 * @example
 * const resolver = createDefaultResolver({
 *   externalContext: { user: { name: "John" } },
 *   formState: { email: "john@example.com" }
 * });
 * resolver("$externalContext.user.name") // "John"
 * resolver("$formState.email") // "john@example.com"
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

    // Handle $formState.*
    if (trimmed.startsWith('$formState.')) {
      const path = trimmed.substring('$formState.'.length);
      return resolveNestedPath(path, context.formState);
    }

    // Handle $externalContext (without path - returns entire object)
    if (trimmed === '$externalContext') {
      return context.externalContext;
    }

    // Handle $formState (without path - returns entire object)
    if (trimmed === '$formState') {
      return context.formState;
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

  return (expression: string): any => {
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
}

