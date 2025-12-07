/**
 * Vue Runtime Adapter
 * 
 * Implements RuntimeAdapter using Vue h() function
 */

import { h, Fragment, VNode } from 'vue';
import type { RuntimeAdapter, ComponentSpec, RenderResult } from '@spectra/core';

/**
 * Vue runtime adapter implementation
 */
export class VueRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec, props: Record<string, any>): RenderResult {
    const component = spec.factory(props, this) as any;
    return h(component, props);
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

