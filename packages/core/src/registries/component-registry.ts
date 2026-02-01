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
  content: {},
  addon: {},
  'menu-item': {},
  'menu-container': {},
};

/**
 * Factory default components
 * 
 * Each factory (React, Vue, Vanilla) sets its built-in components here.
 */
let factoryDefaultComponents: Record<string, ComponentSpec> = {};

/**
 * Set factory default components
 * 
 * Called by each factory to register its built-in components.
 * 
 * @example
 * ```ts
 * setFactoryDefaultComponents({
 *   FormContainer: createComponentSpec({ ... }),
 *   SubmitButton: createComponentSpec({ ... }),
 * });
 * ```
 */
export function setFactoryDefaultComponents(
  components: Record<string, ComponentSpec>
): void {
  factoryDefaultComponents = components;
}

/**
 * Get factory default components
 */
export function getFactoryDefaultComponents(): Record<string, ComponentSpec> {
  return factoryDefaultComponents;
}

/**
 * Get unified component registry
 * 
 * Priority order: local > global > registry overrides > factory defaults
 */
export function getComponentRegistry(
  globalComponents?: Record<string, ComponentSpec>,
  localComponents?: Record<string, ComponentSpec>
): Record<string, ComponentSpec> {
  // Start with factory default components
  const merged: Record<string, ComponentSpec> = { ...factoryDefaultComponents };
  
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

