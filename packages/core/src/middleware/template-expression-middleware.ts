/**
 * Template Expression Middleware
 * 
 * Default middleware that processes template expressions in component props
 * Automatically replaces {{ $externalContext.* }} and {{ $formValues.* }} with actual values
 */

import type { MiddlewareFn, MiddlewareContext } from './types';
import { needsProcessing, processValue } from '../expressions/template-processor';
import { createDefaultResolver } from '../expressions/variable-resolver';

/**
 * Create template expression middleware
 * Processes all template expressions in props recursively
 * 
 * @param context Middleware context (contains externalContext and formState)
 * @returns Middleware function
 * 
 * @example
 * const middleware = createTemplateExpressionMiddleware(middlewareContext);
 * const processedProps = middleware(props, schema, context);
 */
export function createTemplateExpressionMiddleware(
  context: MiddlewareContext
): MiddlewareFn {
  const resolver = createDefaultResolver({
    externalContext: context.externalContext || {},
    formState: context.formState || {},
  });

  return (props: Record<string, any>, schema: any, middlewareContext: MiddlewareContext): Record<string, any> => {
    // Check if processing is needed (optimization)
    if (!needsProcessing(props)) {
      return props;
    }

    // Process all props recursively
    return processValue(props, resolver, {
      externalContext: middlewareContext.externalContext || {},
      formState: middlewareContext.formState || {},
    }) as Record<string, any>;
  };
}

/**
 * Default template expression middleware instance
 * Uses context from middleware execution
 */
export const templateExpressionMiddleware: MiddlewareFn = (
  props: Record<string, any>,
  schema: any,
  context: MiddlewareContext
): Record<string, any> => {
  return createTemplateExpressionMiddleware(context)(props, schema, context);
};

