/**
 * Renderer Registry
 * 
 * Framework-agnostic renderer registration system.
 * Renderers are functions that wrap components with additional rendering logic.
 */

import type { ComponentType, ComponentSpec, RuntimeAdapter } from '../runtime/types';

/**
 * Renderer function - wraps component rendering with additional logic
 */
export type RendererFn = (
  componentSpec: ComponentSpec,
  props: Record<string, any>,
  runtime: RuntimeAdapter,
  children?: any[]
) => any;

/**
 * Default renderers - pass props as is
 */
export const defaultTypeRenderers: Record<ComponentType, RendererFn> = {
  field: (spec, props, runtime, children) => {
    const propsWithChildren = children && children.length > 0 
      ? { ...props, children }
      : props;
    return runtime.create(spec, propsWithChildren);
  },
  'field-wrapper': (spec, props, runtime, children) => {
    const propsWithChildren = children && children.length > 0 
      ? { ...props, children }
      : props;
    return runtime.create(spec, propsWithChildren);
  },
  'container': (spec, props, runtime, children) => {
    return runtime.create(spec, {...props, children});
  },
  content: (spec, props, runtime, children) => {
    const propsWithChildren = children && children.length > 0 
      ? { ...props, children }
      : props;
    return runtime.create(spec, propsWithChildren);
  },
  addon: (spec, props, runtime) => {
    return runtime.create(spec, props);
  },
  'menu-item': (spec, props, runtime, children) => {
    const propsWithChildren = children && children.length > 0 
      ? { ...props, children }
      : props;
    return runtime.create(spec, propsWithChildren);
  },
  'menu-container': (spec, props, runtime, children) => {
    const propsWithChildren = children && children.length > 0 
      ? { ...props, children }
      : props;
    return runtime.create(spec, propsWithChildren);
  },
};

/**
 * Get unified renderer registry with hierarchical merging
 * 
 * Priority order: local > global > default
 */
export function getRendererRegistry(
  globalRenderers?: Partial<Record<ComponentType, RendererFn>>,
  localRenderers?: Partial<Record<ComponentType, RendererFn>>
): Record<ComponentType, RendererFn> {
  // Start with built-in renderers
  let merged = { ...defaultTypeRenderers };
  
  // Apply global renderers (from provider)
  if (globalRenderers) {
    Object.keys(globalRenderers).forEach(type => {
      const renderer = globalRenderers[type as ComponentType];
      if (renderer) {
        merged[type as ComponentType] = renderer;
      }
    });
  }
  
  // Apply local renderers (maximum priority)
  if (localRenderers) {
    Object.keys(localRenderers).forEach(type => {
      const renderer = localRenderers[type as ComponentType];
      if (renderer) {
        merged[type as ComponentType] = renderer;
      }
    });
  }
  
  return merged;
}

/**
 * Get effective renderer for a component type
 * Includes debug logging
 */
export function getRendererForType(
  type: ComponentType,
  globalRenderers?: Partial<Record<ComponentType, RendererFn>>,
  localRenderers?: Partial<Record<ComponentType, RendererFn>>,
  debugEnabled?: boolean
): RendererFn {
  // Local renderers have maximum priority
  if (localRenderers?.[type]) {
    if (debugEnabled) {
      console.log(`Renderer resolved from local: ${type}`);
    }
    return localRenderers[type]!;
  }

  // Global renderers second priority
  if (globalRenderers?.[type]) {
    if (debugEnabled) {
      console.log(`Renderer resolved from global: ${type}`);
    }
    return globalRenderers[type]!;
  }

  // Default renderer last
  if (debugEnabled) {
    console.log(`Renderer resolved from default: ${type}`);
  }
  return defaultTypeRenderers[type];
}

