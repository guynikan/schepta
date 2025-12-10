/**
 * Vue Provider
 * 
 * Vue implementation of schepta Provider
 */

import { provide, inject, defineComponent, h, type Component } from 'vue';
import type { ComponentSpec, ComponentType, DebugConfig } from '@schepta/core';
import type { FormSchema } from '@schepta/core';
import type { MiddlewareFn } from '@schepta/core';
import type { RendererFn } from '@schepta/core';
import { defaultDebugConfig } from '@schepta/core';
import { getRendererRegistry } from '@schepta/core';

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

// Vue injection key
const SCHEPTA_PROVIDER_KEY = Symbol('schepta-provider');

/**
 * Create schepta provider component for Vue
 * 
 * @param props Provider configuration
 * @returns Vue component
 */
export function createScheptaProvider(props: ScheptaProviderProps = {}) {
  return defineComponent({
    name: 'ScheptaProvider',
    props: {
      components: {
        type: Object,
        default: () => props.components || {},
      },
      renderers: {
        type: Object,
        default: () => props.renderers || {},
      },
      middlewares: {
        type: Array,
        default: () => props.middlewares || [],
      },
      debug: {
        type: Object,
        default: () => props.debug || defaultDebugConfig,
      },
      schema: {
        type: Object,
        default: () => props.schema,
      },
      externalContext: {
        type: Object,
        default: () => props.externalContext || {},
      },
    },
    setup(componentProps, { slots }) {
      // Get parent context if exists
      const parentContext = inject<ScheptaContextType | null>(SCHEPTA_PROVIDER_KEY, null);

      // Compute merged context value
      const contextValue: ScheptaContextType = (() => {
        const localMiddlewares = (componentProps.middlewares || []) as MiddlewareFn[];
        
        if (parentContext) {
          // Merge with parent (hierarchical override)
          const mergedRenderers = getRendererRegistry(parentContext.renderers, componentProps.renderers);
          
          return {
            components: { ...parentContext.components, ...componentProps.components },
            renderers: mergedRenderers,
            middlewares: [...parentContext.middlewares, ...localMiddlewares],
            debug: { ...parentContext.debug, ...componentProps.debug },
            schema: (componentProps.schema as FormSchema | undefined) || parentContext.schema,
            externalContext: { ...parentContext.externalContext, ...componentProps.externalContext },
          };
        }

        // Root provider
        const mergedRenderers = getRendererRegistry(undefined, componentProps.renderers);
        const mergedDebug = { ...defaultDebugConfig, ...componentProps.debug };

        return {
          components: componentProps.components || {},
          renderers: mergedRenderers,
          middlewares: localMiddlewares,
          debug: mergedDebug,
          schema: componentProps.schema as FormSchema | undefined,
          externalContext: componentProps.externalContext || {},
        };
      })();

      // Provide context to children
      provide(SCHEPTA_PROVIDER_KEY, contextValue);

      // Render children
      return () => slots.default?.();
    },
  });
}

/**
 * Composable to access schepta context
 * 
 * Returns null if no provider is found (allows optional usage)
 * 
 * @returns ScheptaContextType | null
 */
export function useScheptaContext(): ScheptaContextType | null {
  return inject<ScheptaContextType | null>(SCHEPTA_PROVIDER_KEY, null);
}

/**
 * Composable to access schepta configuration
 * 
 * Throws error if no provider is found (for required usage)
 * 
 * @returns ScheptaContextType
 * @throws Error if no provider is found
 */
export function useSchepta(): ScheptaContextType {
  const context = inject<ScheptaContextType | null>(SCHEPTA_PROVIDER_KEY, null);
  if (!context) {
    throw new Error('useSchepta must be used within a ScheptaProvider');
  }
  return context;
}

