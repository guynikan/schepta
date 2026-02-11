/**
 * React Runtime Adapter
 * 
 * Implements RuntimeAdapter using React.createElement
 */

import React from 'react';
import type { RuntimeAdapter, ComponentSpec, RenderResult, RendererSpec } from '@schepta/core';

/**
 * React runtime adapter implementation
 */
export class ReactRuntimeAdapter implements RuntimeAdapter {
  create(spec: ComponentSpec | RendererSpec, props: Record<string, any>): RenderResult {
    const component = spec.component(props, this);
    // If factory returns a React component type, create element
    if (typeof component === 'function' || typeof component === 'object') {
      return React.createElement(component as any, props);
    }
    // If it's already an element, return it
    return component as RenderResult;
  }

  fragment(children: RenderResult[]): RenderResult {
    return React.createElement(React.Fragment, null, ...(children as React.ReactNode[]));
  }

  isValidElement(value: unknown): boolean {
    return React.isValidElement(value);
  }

  getChildren(element: RenderResult): RenderResult[] {
    if (React.isValidElement(element)) {
      const reactElement = element as React.ReactElement;
      const children = React.Children.toArray(reactElement.props.children);
      return children as RenderResult[];
    }
    return [];
  }

  setProps(element: RenderResult, props: Record<string, any>): void {
    // In React, props are immutable - this would require creating a new element
    // This is mainly for compatibility with the interface
    if (React.isValidElement(element)) {
      // React elements are immutable, so we can't modify them
      // This method exists for interface compatibility
    }
  }
}

/**
 * Create a React runtime adapter instance
 */
export function createReactRuntimeAdapter(): ReactRuntimeAdapter {
  return new ReactRuntimeAdapter();
}

