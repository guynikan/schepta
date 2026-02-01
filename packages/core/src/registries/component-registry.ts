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

export function getFactoryDefaultComponents(): Record<string, ComponentSpec> {
  return factoryDefaultComponents;
};

/**
 * Create a component spec from a factory function
 */
export function createComponentSpec(config: {
  id: string;
  factory: ComponentSpec['factory'];
  type: ComponentType;
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

