/**
 * Vanilla JS Runtime Adapter
 * 
 * Implements RuntimeAdapter using DOM APIs
 */

import type { RuntimeAdapter, ComponentSpec, RendererSpec, RenderResult } from '@schepta/core';

import type { DOMElement } from './types';

/**
 * Vanilla JS runtime adapter implementation
 */
export class VanillaRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec | RendererSpec, props: Record<string, any>): RenderResult {
    if (!spec) {
      console.error('[VanillaRuntime] Invalid spec:', spec);
      throw new Error(`Invalid spec: spec is null/undefined`);
    }
    
    // Handle RendererSpec (for field renderers, etc)
    if ('renderer' in spec && spec.renderer && typeof spec.renderer === 'function') {
      const result = spec.renderer(props);
      if (result instanceof HTMLElement) {
        return this.wrapElement(result, props);
      }
      if (result && 'element' in result) {
        return result as DOMElement;
      }
      throw new Error(`Renderer ${spec.id} did not return a valid element`);
    }
    
    // Handle ComponentSpec
    if (!spec.component) {
      console.error('[VanillaRuntime] Invalid spec:', spec);
      throw new Error(`Invalid component spec: spec.id=${spec.id}, has component=${!!spec.component}`);
    }
    
    // Call component function - it returns the element or factory
    // Pass runtime adapter as second arg for compatibility with spec interface
    const component = spec.component(props, this);
    
    // If component returns a DOM element directly
    if (component instanceof HTMLElement) {
      return this.wrapElement(component, props);
    }
    
    // If component returns a function that creates an element
    if (typeof component === 'function') {
      const element = component(props);
      if (element instanceof HTMLElement) {
        return this.wrapElement(element, props);
      }
    }
    
    // Create a div as fallback
    const div = document.createElement('div');
    div.setAttribute('data-component', spec.id);
    return this.wrapElement(div, props);
  }

  fragment(children: RenderResult[]): RenderResult {
    const fragment = document.createDocumentFragment();
    const domChildren: DOMElement[] = [];
    
    for (const child of children) {
      if (this.isValidElement(child)) {
        const domElement = child as DOMElement;
        fragment.appendChild(domElement.element);
        domChildren.push(domElement);
      }
    }
    
    return {
      element: fragment as any,
      children: domChildren,
      props: {},
    };
  }

  isValidElement(value: unknown): boolean {
    return value !== null && 
           typeof value === 'object' && 
           ('element' in value || value instanceof HTMLElement || value instanceof DocumentFragment);
  }

  getChildren(element: RenderResult): RenderResult[] {
    if (this.isValidElement(element)) {
      if (element instanceof HTMLElement) {
        return Array.from(element.children).map(child => this.wrapElement(child as HTMLElement, {}));
      }
      const domElement = element as DOMElement;
      return domElement.children || [];
    }
    return [];
  }

  setProps(element: RenderResult, props: Record<string, any>): void {
    if (this.isValidElement(element)) {
      const domElement = element instanceof HTMLElement 
        ? this.wrapElement(element, props)
        : element as DOMElement;
      
      Object.assign(domElement.props, props);
      
      // Apply props to actual DOM element
      const el = domElement.element instanceof DocumentFragment 
        ? null 
        : domElement.element;
      
      if (el) {
        for (const [key, value] of Object.entries(props)) {
          if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value);
          } else if (key === 'className' || key === 'class') {
            el.className = String(value);
          } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
          } else if (key.startsWith('data-')) {
            el.setAttribute(key, String(value));
          } else {
            (el as any)[key] = value;
          }
        }
      }
    }
  }

  private wrapElement(element: HTMLElement | DocumentFragment, props: Record<string, any>): DOMElement {
    return {
      element: element as HTMLElement,
      children: [],
      props: { ...props },
    };
  }
}

/**
 * Create a Vanilla JS runtime adapter instance
 */
export function createVanillaRuntimeAdapter(): VanillaRuntimeAdapter {
  return new VanillaRuntimeAdapter();
}

