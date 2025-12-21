/**
 * Field Renderer
 * 
 * Custom renderer that wraps field components with FieldWrapper
 * for react-hook-form integration.
 */

import React from 'react';
import type { ComponentSpec, RendererFn, RuntimeAdapter } from '@schepta/core';
import { sanitizePropsForDOM } from '@schepta/core';
import { FieldWrapper } from '../field-wrapper';

/**
 * Create a field renderer that wraps fields with FieldWrapper
 * 
 * The field renderer handles:
 * - Wrapping field components with react-hook-form Controller
 * - Passing x-component-props to the underlying component
 * - Sanitizing props before passing to DOM components
 * 
 * @returns A renderer function for field components
 */
export function createFieldRenderer(): RendererFn {
  return (
    spec: ComponentSpec,
    props: Record<string, any>,
    runtime: RuntimeAdapter,
    children?: any[]
  ) => {
    // Extract name from props
    const name = props.name || '';

    // If this is a field component and we have a name, wrap it with FieldWrapper
    if (name && spec.type === 'field') {
      const Component = spec.factory(props, runtime);

      const xComponentProps = props['x-component-props'] || {};

      const componentProps = {
        ...xComponentProps,
        name, // Ensure name is passed
      };

      // Create FieldWrapper using React.createElement directly since we're in React context
      return React.createElement(FieldWrapper, {
        name,
        component: Component as any,
        componentProps,
        children,
      });
    }

    // For non-field components or fields without name, use default rendering
    const xComponentProps = props['x-component-props'] || {};
    const mergedProps = { ...props, ...xComponentProps };
    
    // Sanitize props to remove internal Schepta metadata before passing to DOM
    const sanitizedProps = sanitizePropsForDOM(mergedProps);
    
    const propsWithChildren =
      children && children.length > 0
        ? { ...sanitizedProps, children }
        : sanitizedProps;

    return runtime.create(spec, propsWithChildren);
  };
}
