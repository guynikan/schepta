/**
 * Formik Field Wrapper
 * 
 * Custom FieldWrapper that uses Formik's context.
 * This demonstrates how to integrate Formik with Schepta forms.
 */

import React from 'react';
import { useFormikContext } from 'formik';
import type { FieldWrapperProps } from '@schepta/factory-react';

/**
 * Formik-based FieldWrapper component.
 * Uses Formik's context to bind fields to form state.
 * 
 * Register this component via the components prop to use Formik
 * for form state management.
 * 
 * @example
 * ```tsx
 * import { createComponentSpec } from '@schepta/core';
 * 
 * const components = {
 *   FieldWrapper: createComponentSpec({
 *     id: 'FieldWrapper',
 *     type: 'wrapper',
 *     factory: () => FormikFieldWrapper,
 *   }),
 * };
 * ```
 */
export const FormikFieldWrapper: React.FC<FieldWrapperProps> = ({
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
