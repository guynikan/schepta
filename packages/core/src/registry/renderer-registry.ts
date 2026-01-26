/**
 * Renderer Registry
 * 
 * Framework-agnostic renderer registration system.
 * Renderers are functions that wrap components with additional rendering logic.
 */

import type { ComponentType, ComponentSpec, RuntimeAdapter } from '../runtime/types';
import { sanitizePropsForDOM } from '../utils/sanitize-props';

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
 * Default renderers - sanitize props before passing to components
 */
export const defaultTypeRenderers: Record<ComponentType, RendererFn> = {
  field: (spec, props, runtime, children) => {
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
  'field-wrapper': (spec, props, runtime, children) => {
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
  'container': (spec, props, runtime, children) => {
    const xComponentProps = props['x-component-props'] || {};
    const mergedProps = { ...props, ...xComponentProps };
    const sanitized = sanitizePropsForDOM(mergedProps);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
  'FormContainer': (spec, props, runtime, children) => {
    const { onSubmit, externalContext } = props;
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = {
      ...sanitized,
      onSubmit,
      externalContext,
      ...(children && children.length > 0 ? { children } : {}),
    };
    return runtime.create(spec, propsWithChildren);
  },
  content: (spec, props, runtime, children) => {
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
  addon: (spec, props, runtime) => {
    const sanitized = sanitizePropsForDOM(props);
    return runtime.create(spec, sanitized);
  },
  'menu-item': (spec, props, runtime, children) => {
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
  'menu-container': (spec, props, runtime, children) => {
    const sanitized = sanitizePropsForDOM(props);
    const propsWithChildren = children && children.length > 0 
      ? { ...sanitized, children }
      : sanitized;
    return runtime.create(spec, propsWithChildren);
  },
};

/**
 * Renderer registry overrides
 */
const rendererRegistryOverrides = new Map<ComponentType, RendererFn>();

/**
 * Register a renderer override globally
 */
export function registerRenderer(type: ComponentType, renderer: RendererFn): void {
  rendererRegistryOverrides.set(type, renderer);
}

/**
 * Get renderer by type with registry overrides
 */
export function getRendererByType(type: ComponentType): RendererFn {
  return rendererRegistryOverrides.get(type) || defaultTypeRenderers[type];
}

/**
 * Get unified renderer registry with hierarchical merging
 * 
 * Priority order: local > global > registry overrides > default
 */
export function getRendererRegistry(
  globalRenderers?: Partial<Record<ComponentType, RendererFn>>,
  localRenderers?: Partial<Record<ComponentType, RendererFn>>
): Record<ComponentType, RendererFn> {
  // Start with built-in renderers
  let merged = { ...defaultTypeRenderers };
  
  // Apply registry overrides (global registrations)
  rendererRegistryOverrides.forEach((renderer, type) => {
    merged[type] = renderer;
  });
  
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

  // Registry overrides third priority
  if (rendererRegistryOverrides.has(type)) {
    if (debugEnabled) {
      console.log(`Renderer resolved from registry override: ${type}`);
    }
    return rendererRegistryOverrides.get(type)!;
  }

  // Default renderer last
  if (debugEnabled) {
    console.log(`Renderer resolved from default: ${type}`);
  }
  return defaultTypeRenderers[type];
}

