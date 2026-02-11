/**
 * Provider Types
 * 
 * Framework-agnostic provider configuration types
 */

import type { ComponentSpec, ComponentType, DebugConfig } from '../runtime/types';
import type { FormSchema } from '../schema/schema-types';
import type { MiddlewareFn } from '../middleware/types';
import { RendererFn } from '../defaults/register-default-renderers';

/**
 * Provider configuration
 * 
 * Contains all global configurations that can be provided to factories
 */
export interface ProviderConfig {
  /** Global component registry */
  components?: Record<string, ComponentSpec>;
  
  /** Global renderer registry by component type */
  renderers?: Partial<Record<ComponentType, RendererFn>>;
  
  /** Global middleware stack */
  middlewares?: MiddlewareFn[];
  
  /** External context (user, permissions, etc.) */
  externalContext?: Record<string, any>;
  
  /** Debug configuration */
  debug?: DebugConfig;
  
  /** Form schema (for reactions and context access) */
  schema?: FormSchema;
}

/**
 * Default debug configuration
 */
export const defaultDebugConfig: DebugConfig = {
  enabled: false,
  logComponentResolution: false,
  logMiddlewareExecution: false,
  logReactions: false,
};

