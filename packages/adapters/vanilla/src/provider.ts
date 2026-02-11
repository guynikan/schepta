/**
 * Vanilla Provider
 * 
 * Vanilla JS implementation of schepta Provider
 */

import type { ComponentSpec, ComponentType, DebugConfig } from '@schepta/core';
import type { FormSchema } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';
import type { RendererFn } from '@schepta/core';
import { defaultDebugConfig } from '@schepta/core';

/**
 * Provider configuration type
 */
export interface ScheptaProviderProps {
  components?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<ComponentType, RendererFn>>;
  middlewares?: MiddlewareFn[];
  debug?: DebugConfig;
  schema?: FormSchema;
  externalContext?: Record<string, any>;
}

/**
 * Provider context type
 */
export interface ScheptaContextType {
  components: Record<string, ComponentSpec>;
  renderers: Record<ComponentType, RendererFn>;
  middlewares: MiddlewareFn[];
  debug: DebugConfig;
  schema?: FormSchema;
  externalContext: Record<string, any>;
}

// Map to store provider configs by container element
const providerMap = new WeakMap<HTMLElement, ScheptaContextType>();

/**
 * Create schepta provider for Vanilla JS
 * 
 * Associates a provider configuration with a DOM container element.
 * Child elements can access the provider config by traversing up the DOM tree.
 * 
 * @param container Container element for this provider
 * @param props Provider configuration
 * @returns Provider instance with destroy method
 */
export function createScheptaProvider(
  container: HTMLElement,
  props: ScheptaProviderProps = {}
): { destroy: () => void } {
  // Get parent provider config (if container has a parent with provider)
  const parentContext = getParentProviderContext(container);

  // Compute merged context value
  const contextValue = (() => {
    if (parentContext) {
      // Merge with parent (hierarchical override)
      const mergedRenderers = { ...parentContext.renderers, ...props.renderers };
      
      return {
        components: { ...parentContext.components, ...(props.components || {}) },
        renderers: mergedRenderers,
        middlewares: [...parentContext.middlewares, ...(props.middlewares || [])],
        debug: { ...parentContext.debug, ...props.debug },
        schema: props.schema || parentContext.schema,
        externalContext: { ...parentContext.externalContext, ...(props.externalContext || {}) },
      };
    }

    // Root provider
    const mergedDebug = { ...defaultDebugConfig, ...props.debug };

    return {
      components: props.components || {},
      renderers: props.renderers,
      middlewares: props.middlewares || [],
      debug: mergedDebug,
      schema: props.schema,
      externalContext: props.externalContext || {},
    };
  })();

  // Store provider config in map
  providerMap.set(container, contextValue as ScheptaContextType);

  return {
    destroy: () => {
      providerMap.delete(container);
    },
  };
}

/**
 * Get parent provider context by traversing up the DOM tree
 */
function getParentProviderContext(element: HTMLElement): ScheptaContextType | null {
  let current: HTMLElement | null = element.parentElement;
  
  while (current) {
    const context = providerMap.get(current);
    if (context) {
      return context;
    }
    current = current.parentElement;
  }
  
  return null;
}

/**
 * Get schepta context for a container element
 * 
 * Traverses up the DOM tree to find the nearest provider.
 * Returns null if no provider is found.
 * 
 * @param container Container element
 * @returns ScheptaContextType | null
 */
export function getScheptaContext(container: HTMLElement): ScheptaContextType | null {
  // Check current element first
  const directContext = providerMap.get(container);
  if (directContext) {
    return directContext;
  }
  
  // Traverse up to find parent provider
  return getParentProviderContext(container);
}

/**
 * Get schepta configuration for a container element
 * 
 * Throws error if no provider is found.
 * 
 * @param container Container element
 * @returns ScheptaContextType
 * @throws Error if no provider is found
 */
export function getSchepta(container: HTMLElement): ScheptaContextType {
  const context = getScheptaContext(container);
  if (!context) {
    throw new Error('getSchepta: No ScheptaProvider found for container');
  }
  return context;
}

