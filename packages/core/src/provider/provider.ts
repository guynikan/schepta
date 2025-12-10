/**
 * Provider Utilities
 * 
 * Framework-agnostic utilities for provider configuration management
 */

import type { ProviderConfig } from './types';
import { defaultDebugConfig } from './types';
import { getRendererRegistry } from '../registry/renderer-registry';

/**
 * Merge two provider configurations hierarchically
 * 
 * Priority: local > global
 * 
 * @param local Local configuration (higher priority)
 * @param global Global configuration (lower priority)
 * @returns Merged configuration
 */
export function mergeProviderConfigs(
  local: ProviderConfig,
  global: ProviderConfig
): ProviderConfig {
  // Merge components (local overrides global)
  const mergedComponents = {
    ...global.components,
    ...local.components,
  };

  // Merge renderers using registry function (handles hierarchical merging)
  const mergedRenderers = getRendererRegistry(
    global.renderers,
    local.renderers
  );

  // Merge middlewares (local appended after global)
  const mergedMiddlewares = [
    ...(global.middlewares || []),
    ...(local.middlewares || []),
  ];

  // Merge external context (local overrides global)
  const mergedExternalContext = {
    ...global.externalContext,
    ...local.externalContext,
  };

  // Merge debug config (local overrides global, but merge nested properties)
  const mergedDebug = {
    ...defaultDebugConfig,
    ...global.debug,
    ...local.debug,
  };

  // Schema: use local if provided, otherwise global
  const mergedSchema = local.schema || global.schema;

  return {
    components: mergedComponents,
    renderers: mergedRenderers,
    middlewares: mergedMiddlewares,
    externalContext: mergedExternalContext,
    debug: mergedDebug,
    schema: mergedSchema,
  };
}

/**
 * Resolve final configuration from local and global configs
 * 
 * @param local Local configuration (from factory props)
 * @param global Global configuration (from provider)
 * @returns Resolved configuration
 */
export function resolveProviderConfig(
  local?: ProviderConfig,
  global?: ProviderConfig | null
): ProviderConfig {
  // If no global config, return local or empty
  if (!global) {
    return local || {
      components: {},
      renderers: {},
      middlewares: [],
      externalContext: {},
      debug: defaultDebugConfig,
    };
  }

  // If no local config, return global
  if (!local) {
    return global;
  }

  // Merge both
  return mergeProviderConfigs(local, global);
}

