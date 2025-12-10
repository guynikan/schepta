/**
 * React Provider
 * 
 * React implementation of schepta Provider
 */

import React, { useMemo, useContext, createContext } from 'react';
import type { ComponentSpec, ComponentType, DebugConfig } from '@schepta/core';
import type { FormSchema } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';
import type { RendererFn } from '@schepta/core';
import { defaultDebugConfig } from '@schepta/core';
import { getRendererRegistry } from '@schepta/core';

/**
 * Provider configuration type (matches SpectraProviderProps from old project)
 */
export interface ScheptaProviderProps {
  children: React.ReactNode;
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

// Create React context for provider
const ScheptaContext = createContext<ScheptaContextType | null>(null);

/**
 * ScheptaProvider component
 * 
 * Provides global configuration to all factories in the component tree.
 * Supports hierarchical providers (nested providers merge with parent).
 * 
 * @example
 * ```tsx
 * <ScheptaProvider
 *   components={{ InputText: MUITextField }}
 *   renderers={{ field: CustomFieldRenderer }}
 *   middlewares={[withValidation]}
 *   debug={{ enabled: true }}
 * >
 *   <App />
 * </ScheptaProvider>
 * ```
 */
export function ScheptaProvider({
  children,
  components = {},
  renderers = {},
  middlewares = [],
  debug = defaultDebugConfig,
  schema,
  externalContext = {},
}: ScheptaProviderProps) {
  // Check if we're nested inside another ScheptaProvider (Material-UI pattern)
  const parentContext = useContext(ScheptaContext);

  const contextValue = useMemo<ScheptaContextType>(() => {
    // If we have a parent context, merge with it (hierarchical override)
    if (parentContext) {
      // Use renderer registry for hierarchical merging
      const mergedRenderers = getRendererRegistry(parentContext.renderers, renderers);
      
      return {
        components: { ...parentContext.components, ...components },
        renderers: mergedRenderers,
        middlewares: [...parentContext.middlewares, ...middlewares],
        debug: { ...parentContext.debug, ...debug },
        schema: schema || parentContext.schema,
        externalContext: { ...parentContext.externalContext, ...externalContext },
      };
    }

    // If we're the root provider, use renderer registry with defaults
    const mergedRenderers = getRendererRegistry(undefined, renderers);
    const mergedDebug = { ...defaultDebugConfig, ...debug };

    return {
      components,
      renderers: mergedRenderers,
      middlewares,
      debug: mergedDebug,
      schema,
      externalContext,
    };
  }, [parentContext, components, renderers, middlewares, debug, schema, externalContext]);

  return (
    <ScheptaContext.Provider value={contextValue}>
      {children}
    </ScheptaContext.Provider>
  );
}

// Export context for advanced usage
export { ScheptaContext };

/**
 * Hook to access schepta context
 * 
 * Returns null if no provider is found (allows optional usage)
 * 
 * @returns ScheptaContextType | null
 */
export function useScheptaContext(): ScheptaContextType | null {
  return useContext(ScheptaContext);
}

/**
 * Hook to access schepta configuration
 * 
 * Throws error if no provider is found (for required usage)
 * 
 * @returns ScheptaContextType
 * @throws Error if no provider is found
 */
export function useSchepta(): ScheptaContextType {
  const context = useContext(ScheptaContext);
  if (!context) {
    throw new Error('useSchepta must be used within a ScheptaProvider');
  }
  return context;
}

