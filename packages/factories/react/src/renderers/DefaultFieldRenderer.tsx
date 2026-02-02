/**
 * Default Field Renderer Component
 * 
 * Renders field components with native Schepta form adapter binding.
 * No external dependencies (react-hook-form, formik, etc.)
 * 
 * Users can create custom field renderers for RHF, Formik, etc.
 * by implementing the FieldRendererProps interface.
 */

import React from 'react';
import { useScheptaFormAdapter, useScheptaFieldValue } from '../context/schepta-form-context';
import { FieldRendererProps } from '@schepta/core';

/**
 * Type for custom field renderer components.
 * Use this when creating a custom renderer for RHF, Formik, etc.
 * 
 * @example Creating a custom RHF field renderer
 * ```tsx
 * import { ReactFieldRendererProps } from '@schepta/factory-react';
 * import { Controller, useFormContext } from 'react-hook-form';
 * 
 * export const RHFFieldRenderer: React.FC<ReactFieldRendererProps> = ({
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
export type FieldRendererType = React.ComponentType<FieldRendererProps>;

/**
 * Default field renderer - uses native Schepta form adapter.
 * No external dependencies (RHF, Formik, etc.)
 * 
 * This is the built-in field renderer that uses the ScheptaFormContext
 * to bind field values. For custom form libraries, create your own
 * field renderer and register it via the renderers prop.
 * 
 * @example Using default (automatic via FormFactory)
 * ```tsx
 * <FormFactory schema={schema} onSubmit={handleSubmit} />
 * ```
 * 
 * @example Using custom field renderer
 * ```tsx
 * import { createRendererSpec } from '@schepta/core';
 * import { RHFFieldRenderer } from './rhf/RHFFieldRenderer';
 * 
 * const renderers = {
 *   field: createRendererSpec({
 *     id: 'rhf-field-renderer',
 *     type: 'field',
 *     component: RHFFieldRenderer,
 *   }),
 * };
 * 
 * <FormFactory schema={schema} renderers={renderers} onSubmit={handleSubmit} />
 * ```
 */
export const DefaultFieldRenderer: React.FC<FieldRendererProps> = ({
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
