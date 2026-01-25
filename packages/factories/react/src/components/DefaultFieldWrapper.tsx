/**
 * Default Field Wrapper Component
 * 
 * Wraps field components with native form adapter binding.
 * No external dependencies (react-hook-form, formik, etc.)
 * 
 * Users can create custom FieldWrappers for RHF, Formik, etc.
 * by implementing the FieldWrapperProps interface.
 */

import React from 'react';
import { useScheptaFormAdapter, useScheptaFieldValue } from '../context/schepta-form-context';

/**
 * Props interface for FieldWrapper components.
 * 
 * Export this type for users creating custom wrappers (RHF, Formik, etc.)
 * 
 * @example Creating a custom RHF FieldWrapper
 * ```tsx
 * import { FieldWrapperProps } from '@schepta/factory-react';
 * import { Controller, useFormContext } from 'react-hook-form';
 * 
 * export const RHFFieldWrapper: React.FC<FieldWrapperProps> = ({
 *   name,
 *   component: Component,
 *   componentProps = {},
 *   children,
 * }) => {
 *   const { control } = useFormContext();
 *   return (
 *     <Controller
 *       name={name}
 *       control={control}
 *       render={({ field }) => (
 *         <Component {...componentProps} {...field}>{children}</Component>
 *       )}
 *     />
 *   );
 * };
 * ```
 */
export interface FieldWrapperProps {
  /** Field name (supports dot notation for nested fields) */
  name: string;
  /** The field component to wrap */
  component: React.ComponentType<any>;
  /** Props to pass to the field component */
  componentProps?: Record<string, any>;
  /** Optional children */
  children?: React.ReactNode;
}

/**
 * Type for custom FieldWrapper components.
 * Use this when registering a custom FieldWrapper in components.
 * 
 * @example
 * ```tsx
 * const components = {
 *   FieldWrapper: createComponentSpec({
 *     id: 'FieldWrapper',
 *     type: 'wrapper',
 *     factory: () => MyCustomFieldWrapper as FieldWrapperType,
 *   }),
 * };
 * ```
 */
export type FieldWrapperType = React.ComponentType<FieldWrapperProps>;

/**
 * Default FieldWrapper - uses native adapter only.
 * No external dependencies (RHF, Formik, etc.)
 * 
 * This is the built-in field wrapper that uses the ScheptaFormContext
 * to bind field values. For custom form libraries, create your own
 * FieldWrapper and register it via the components prop.
 * 
 * @example Using default (automatic via FormFactory)
 * ```tsx
 * <FormFactory schema={schema} onSubmit={handleSubmit} />
 * ```
 * 
 * @example Using custom FieldWrapper
 * ```tsx
 * import { createComponentSpec } from '@schepta/core';
 * import { RHFFieldWrapper } from './my-rhf-wrapper';
 * 
 * const components = {
 *   FieldWrapper: createComponentSpec({
 *     id: 'FieldWrapper',
 *     type: 'wrapper',
 *     factory: () => RHFFieldWrapper,
 *   }),
 * };
 * 
 * <FormFactory schema={schema} components={components} onSubmit={handleSubmit} />
 * ```
 */
export const DefaultFieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  component: Component,
  componentProps = {},
  children,
}) => {
  const adapter = useScheptaFormAdapter();
  // Use the hook for reactivity - re-renders when this field's value changes
  const value = useScheptaFieldValue(name);

  const handleChange = (newValue: any) => {
    adapter.setValue(name, newValue);
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
