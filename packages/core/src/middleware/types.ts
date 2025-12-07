/**
 * Middleware System Types
 * 
 * Framework-agnostic middleware for transforming component props.
 */

import type { FormAdapter } from '../forms/types';
import type { DebugContextValue } from '../runtime/types';

/**
 * Middleware context - provides access to form state and external context
 */
export interface MiddlewareContext {
  /** Current form state */
  formState: Record<string, any>;
  /** External context (user data, API services, etc.) */
  externalContext: Record<string, any>;
  /** Debug utilities */
  debug?: DebugContextValue;
  /** Form adapter for form operations */
  formAdapter?: FormAdapter;
}

/**
 * Middleware function - transforms props based on schema and context
 */
export type MiddlewareFn = (
  props: Record<string, any>,
  schema: any,
  context: MiddlewareContext
) => Record<string, any>;

/**
 * Middleware registry
 */
const middlewareRegistry = new Map<string, MiddlewareFn>();

/**
 * Register a middleware globally
 */
export function registerMiddleware(name: string, middleware: MiddlewareFn): void {
  middlewareRegistry.set(name, middleware);
}

/**
 * Get a middleware by name
 */
export function getMiddleware(name: string): MiddlewareFn | undefined {
  return middlewareRegistry.get(name);
}

/**
 * Get all registered middlewares
 */
export function getAllMiddlewares(): Map<string, MiddlewareFn> {
  return middlewareRegistry;
}

/**
 * Apply middlewares in sequence
 */
export function applyMiddlewares(
  props: Record<string, any>,
  schema: any,
  middlewares: MiddlewareFn[],
  context: MiddlewareContext
): Record<string, any> {
  let result = props;
  
  for (const middleware of middlewares) {
    try {
      result = middleware(result, schema, context);
    } catch (error) {
      if (context.debug?.isEnabled) {
        context.debug.log('middleware', `Error in middleware: ${error}`, { error, schema });
      }
      console.warn('Middleware error:', error);
    }
  }
  
  return result;
}

