/**
 * Component Registry
 *
 * Framework-agnostic component registration helpers.
 * Factories declare their own defaults locally and pass them to the
 * factory primitive — there is no module-level global state here.
 */

import type { ComponentSpec, ComponentType } from '../runtime/types';

/**
 * Default props for each component type
 */
export const defaultTypeProps: Record<ComponentType, Record<string, any>> = {
  field: { fullWidth: true },
  button: {},
  'container': {},
  content: {},
  addon: {},
  'menu-item': {},
  'menu-container': {},
};

/**
 * Create a component spec from a factory function
 */
export function createComponentSpec(config: {
  id: string;
  component: ComponentSpec['component'];
  type: ComponentType;
  displayName?: string;
  defaultProps?: Record<string, any>;
}): ComponentSpec {
  return {
    id: config.id,
    component: config.component,
    type: config.type,
    displayName: config.displayName || config.id,
    defaultProps: config.defaultProps || (config.type ? defaultTypeProps[config.type] : {}),
  };
}
