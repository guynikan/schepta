/**
 * useMergedScheptaConfig Hook
 * 
 * Merges provider configuration with local FormFactory props.
 * Provider config serves as base, local props override.
 */

import { useMemo } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import { useScheptaContext } from '@schepta/adapter-react';

export interface MergedConfigInput {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  debug?: boolean;
}

export interface MergedConfig {
  components: Record<string, ComponentSpec>;
  customComponents: Record<string, ComponentSpec>;
  renderers: Partial<Record<string, any>>;
  externalContext: Record<string, any>;
  baseMiddlewares: MiddlewareFn[];
  debug: boolean;
}

/**
 * Hook to merge provider configuration with local props
 * 
 * @param props - Local FormFactory props
 * @returns Merged configuration with provider as base and local as override
 */
export function useMergedScheptaConfig(props: MergedConfigInput): MergedConfig {
  const providerConfig = useScheptaContext();

  return useMemo(() => ({
    components: {
      ...(providerConfig?.components || {}),
      ...(props.components || {}),
    },
    customComponents: {
      ...(providerConfig?.customComponents || {}),
      ...(props.customComponents || {}),
    },
    renderers: {
      ...(providerConfig?.renderers || {}),
      ...(props.renderers || {}),
    },
    externalContext: {
      ...(providerConfig?.externalContext || {}),
      ...(props.externalContext || {}),
    },
    baseMiddlewares: [
      ...(providerConfig?.middlewares || []),
      ...(props.middlewares || []),
    ],
    debug: props.debug !== undefined 
      ? props.debug 
      : (providerConfig?.debug?.enabled || false),
  }), [
    providerConfig?.components,
    providerConfig?.customComponents,
    providerConfig?.renderers,
    providerConfig?.externalContext,
    providerConfig?.middlewares,
    providerConfig?.debug?.enabled,
    props.components,
    props.customComponents,
    props.renderers,
    props.externalContext,
    props.middlewares,
    props.debug,
  ]);
}

