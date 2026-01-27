/**
 * Field Renderer
 * 
 * Custom renderer that wraps field components with FieldWrapper.
 * Supports custom FieldWrapper components via registry (local > global > default).
 */

import React from 'react';
import type { ComponentSpec, RendererFn, RuntimeAdapter } from '@schepta/core';
import { sanitizePropsForDOM } from '@schepta/core';
import { DefaultFieldWrapper, type FieldWrapperType } from '../components/DefaultFieldWrapper';

/**
 * Options for creating the field renderer
 */
export interface FieldRendererOptions {
  /**
   * Custom FieldWrapper component.
   * If not provided, uses DefaultFieldWrapper (native adapter).
   * 
   * Users can provide their own FieldWrapper for RHF, Formik, etc.
   */
  FieldWrapper?: FieldWrapperType;
}

/**
 * Create a field renderer that wraps fields with FieldWrapper
 * 
 * The field renderer handles:
 * - Wrapping field components with the configured FieldWrapper
 * - Passing x-component-props to the underlying component
 * - Sanitizing props before passing to DOM components
 * 
 * @param options - Optional configuration including custom FieldWrapper
 * @returns A renderer function for field components
 * 
 * @example Using default FieldWrapper (native)
 * ```tsx
 * const fieldRenderer = createFieldRenderer();
 * ```
 * 
 */
export function createFieldRenderer(options: FieldRendererOptions = {}): RendererFn {
  const { FieldWrapper = DefaultFieldWrapper } = options;

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
        ...(props.externalContext ? { externalContext: props.externalContext } : {}),
        ...(props.schema ? { schema: props.schema } : {}),
        ...(props.componentKey ? { componentKey: props.componentKey } : {}),
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
