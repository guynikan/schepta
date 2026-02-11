/**
 * Formik Field Renderer
 * 
 * Custom field renderer that uses Formik's context.
 * This demonstrates how to integrate Formik with Schepta forms.
 */

import React from 'react';
import { useFormikContext } from 'formik';
import type { FieldRendererProps } from '@schepta/core';

/**
 * Formik-based field renderer component.
 * Uses Formik's context to bind fields to form state.
 * 
 * Register this renderer via the renderers prop to use Formik
 * for form state management.
 * 
 * @example
 * ```tsx
 * import { createRendererSpec } from '@schepta/core';
 * import { FormikFieldRenderer } from './formik/FormikFieldRenderer';
 * 
 * const renderers = {
 *   field: createRendererSpec({
 *     id: 'formik-field-renderer',
 *     type: 'field',
 *     component: FormikFieldRenderer,
 *   }),
 * };
 * 
 * <FormFactory renderers={renderers} />
 * ```
 */
export const FormikFieldRenderer: React.FC<FieldRendererProps> = ({
  name,
  component: Component,
  componentProps = {},
  children,
}) => {
  const formik = useFormikContext<Record<string, any>>();
  
  // Get value from Formik state (support nested paths)
  const value = name.split('.').reduce((obj: any, key) => {
    return obj?.[key];
  }, formik.values);

  const handleChange = (newValue: any) => {
    formik.setFieldValue(name, newValue);
  };

  return (
    <Component
      {...componentProps}
      name={name}
      value={value !== undefined && value !== null ? value : (componentProps.value || '')}
      onChange={handleChange}
    >
      {children}
    </Component>
  );
};
