/**
 * Vue Runtime Adapter
 * 
 * Implements RuntimeAdapter using Vue h() function
 */

import { h, Fragment, VNode } from 'vue';
import { sanitizeDOMProps, type RuntimeAdapter, type ComponentSpec, type RenderResult, type RendererSpec } from '@schepta/core';

// VNodes built by this adapter. Vue has no Symbol guard on VNodes: any object
// with `__v_isVNode: true` in child position is mounted as a real element, and
// schema JSON can forge one (`{"__v_isVNode":true,"type":"img","props":{...}}`).
// A forged VNode cannot be told apart by its shape, because every field Vue
// reads is JSON-serialisable, so slot content is checked by provenance instead:
// the orchestrator only ever hands over results of `create()`/`fragment()`, and
// a JSON-derived object can never be a member of this set. Membership outlives
// a render pass on purpose, since the orchestrator caches static subtrees.
const adapterVNodes = new WeakSet<object>();

function track<T>(vnode: T): T {
  if (vnode !== null && typeof vnode === 'object') adapterVNodes.add(vnode);
  return vnode;
}

/**
 * Keeps only the children that are safe to mount: VNodes built by this adapter
 * and plain text. Every other object (a forged VNode, an array, a schema value)
 * is dropped.
 */
function toSlotChildren(children: unknown): VNode[] {
  if (!Array.isArray(children)) return [];

  return children.filter((child) => {
    if (typeof child === 'string' || typeof child === 'number') return true;
    if (child !== null && typeof child === 'object' && adapterVNodes.has(child)) return true;
    if (child !== null && child !== undefined && typeof child !== 'boolean') {
      console.warn('[Schepta] Dropped a child that was not rendered by the Vue runtime adapter.');
    }
    return false;
  }) as VNode[];
}

/**
 * Vue runtime adapter implementation
 */
export class VueRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec | RendererSpec, props: Record<string, any>): RenderResult {
    if (!spec.component) {
      throw new Error(`Component ${(spec as any).id} is not a function`);
    }
    const component = spec.component(props, this) as any;
    
    // `children` is the orchestrator-provided list (the renderer orchestrator
    // strips any schema-supplied `children` before adding its own). It is the
    // only source of slot content and never reaches the component as a prop.
    const { children, ...componentProps } = props;
    // Components receive every prop untouched. A native tag has no code of its
    // own to vet schema props, so the allowlist applies here.
    const restProps = typeof component === 'string'
      ? sanitizeDOMProps(componentProps, component)
      : componentProps;
    
    const slotChildren = toSlotChildren(children);

    if (slotChildren.length > 0) {
      // Components get a function slot, which avoids the Vue warning about
      // non-function default slots. A native tag takes the children directly.
      return track(h(component, restProps, typeof component === 'string' ? slotChildren : () => slotChildren));
    }
    
    return track(h(component, restProps));
  }

  fragment(children: RenderResult[]): RenderResult {
    return track(h(Fragment, null, toSlotChildren(children)));
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
        Object.assign(vnode.props, typeof vnode.type === 'string' ? sanitizeDOMProps(props, vnode.type) : props);
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

