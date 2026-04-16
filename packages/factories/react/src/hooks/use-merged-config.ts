/**
 * useMergedScheptaConfig Hook
 *
 * Merges factory defaults + provider configuration + local factory props
 * into a single resolved configuration.
 *
 * Priority (later wins): factory defaults < provider < local props.
 */

import { useMemo } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import { useScheptaContext } from '@schepta/adapter-react';

export interface MergedConfigInput {
  /** Factory built-in default components (lowest priority) */
  defaultComponents?: Record<string, ComponentSpec>;
  /** Factory built-in default renderers by type (lowest priority) */
  defaultRenderers?: Partial<Record<string, any>>;
  /** Local components override (highest priority) */
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
 * Hook to merge factory defaults, provider and local factory props.
 *
 * @param props Factory defaults + local overrides
 * @returns Resolved configuration
 */
export function useMergedScheptaConfig(props: MergedConfigInput): MergedConfig {
  const providerConfig = useScheptaContext();

  return useMemo(() => ({
    components: {
      ...(props.defaultComponents || {}),
      ...(providerConfig?.components || {}),
      ...(props.components || {}),
    },
    customComponents: {
      ...(providerConfig?.customComponents || {}),
      ...(props.customComponents || {}),
    },
    renderers: {
      ...(props.defaultRenderers || {}),
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
    props.defaultComponents,
    props.defaultRenderers,
    props.components,
    props.customComponents,
    props.renderers,
    props.externalContext,
    props.middlewares,
    props.debug,
  ]);
}
