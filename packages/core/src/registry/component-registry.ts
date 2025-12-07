/**
 * Component Registry
 * 
 * Framework-agnostic component registration and resolution system.
 * Maintains hierarchical priority: local > global > default
 */

import type { ComponentSpec, ComponentType } from '../runtime/types';

/**
 * Default props for each component type
 */
export const defaultTypeProps: Record<ComponentType, Record<string, any>> = {
  field: { fullWidth: true },
  'field-wrapper': {},
  'container': {},
  'form-container': {},
  content: {},
  addon: {},
  'menu-item': {},
  'menu-container': {},
};

/**
 * Default component registry (empty by default, can be extended)
 */
export const defaultComponentRegistry: Record<string, ComponentSpec> = {};

/**
 * Registry overrides (global registrations)
 */
const registryOverrides = new Map<string, Partial<ComponentSpec>>();

/**
 * Register a component override globally
 */
export function registerComponent(name: string, config: Partial<ComponentSpec>): void {
  registryOverrides.set(name, {
    ...registryOverrides.get(name),
    ...config,
  });
}

/**
 * Get unified component registry
 * 
 * Priority order: local > global > registry overrides > default
 */
export function getComponentRegistry(
  globalComponents?: Record<string, ComponentSpec>,
  localComponents?: Record<string, ComponentSpec>
): Record<string, ComponentSpec> {
  // Start with built-in components
  const merged: Record<string, ComponentSpec> = { ...defaultComponentRegistry };
  
  // Apply global components (from provider)
  if (globalComponents) {
    Object.keys(globalComponents).forEach(componentName => {
      const component = globalComponents[componentName];
      if (component) {
        merged[componentName] = component;
      }
    });
  }

  // Apply local components (maximum priority)
  if (localComponents) {
    Object.keys(localComponents).forEach(componentName => {
      const component = localComponents[componentName];
      if (component) {
        merged[componentName] = component;
      }
    });
  }

  // Apply registry overrides
  for (const [name, override] of Array.from(registryOverrides.entries())) {
    const existing = merged[name];
    merged[name] = {
      ...existing,
      ...override,
      id: override.id || existing?.id || name,
    } as ComponentSpec;
  }

  return merged;
}

/**
 * Get effective component configuration
 * Includes fallback logic and debug logging
 */
export function getComponentSpec(
  componentName: string,
  globalComponents?: Record<string, ComponentSpec>,
  localComponents?: Record<string, ComponentSpec>,
  debugEnabled?: boolean
): ComponentSpec | null {
  // Local components have maximum priority
  if (localComponents?.[componentName]) {
    if (debugEnabled) {
      console.log(`Component resolved from local: ${componentName}`);
    }
    return localComponents[componentName];
  }

  const globalRegistry = getComponentRegistry(globalComponents, localComponents);
  
  if (globalRegistry[componentName]) {
    if (debugEnabled) {
      console.log(`Component resolved from registry: ${componentName}`);
    }
    return globalRegistry[componentName];
  }

  if (debugEnabled) {
    console.warn(`Component not found: ${componentName}`);
  }
  
  return null;
}

/**
 * Create a component spec from a factory function
 */
export function createComponentSpec(config: {
  id: string;
  factory: ComponentSpec['factory'];
  type?: ComponentType;
  displayName?: string;
  defaultProps?: Record<string, any>;
}): ComponentSpec {
  return {
    id: config.id,
    factory: config.factory,
    type: config.type,
    displayName: config.displayName || config.id,
    defaultProps: config.defaultProps || (config.type ? defaultTypeProps[config.type] : {}),
  };
}

