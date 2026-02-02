/**
 * Vue Runtime Adapter
 * 
 * Implements RuntimeAdapter using Vue h() function
 */

import { h, Fragment, VNode } from 'vue';
import type { RuntimeAdapter, ComponentSpec, RenderResult } from '@schepta/core';

/**
 * Vue runtime adapter implementation
 */
export class VueRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec, props: Record<string, any>): RenderResult {
    const component = spec.component(props, this) as any;
    
    // Extract children from props if present (Vue passes children as third argument to h())
    const { children, ...restProps } = props;
    
    // If children are provided, pass them as third argument to h()
    // Vue prefers function slots for better performance when using defineComponent with slots
    if (children && Array.isArray(children) && children.length > 0) {
      // Always pass children as a function for components that use slots
      // This avoids the Vue warning about non-function default slots
      return h(component, restProps, () => children);
    }
    
    return h(component, restProps);
  }

  fragment(children: RenderResult[]): RenderResult {
    return h(Fragment, null, children as VNode[]);
  }

  isValidElement(value: unknown): boolean {
    return value !== null && typeof value === 'object' && 'type' in value;
  }

  getChildren(element: RenderResult): RenderResult[] {
    if (this.isValidElement(element)) {
      const vnode = element as VNode;
      return Array.isArray(vnode.children) ? vnode.children as RenderResult[] : [];
    }
    return [];
  }

  setProps(element: RenderResult, props: Record<string, any>): void {
    // Vue VNodes are immutable - this is for interface compatibility
    if (this.isValidElement(element)) {
      const vnode = element as VNode;
      if (vnode.props) {
        Object.assign(vnode.props, props);
      }
    }
  }
}

/**
 * Create a Vue runtime adapter instance
 */
export function createVueRuntimeAdapter(): VueRuntimeAdapter {
  return new VueRuntimeAdapter();
}

