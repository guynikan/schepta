/**
 * RHF Field Renderer
 * 
 * Custom field renderer that uses react-hook-form's Controller.
 * This demonstrates how to integrate RHF with Schepta forms.
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldRendererProps } from '@schepta/core';

/**
 * RHF-based field renderer component.
 * Uses react-hook-form's Controller to bind fields to form state.
 * 
 * Register this renderer via the renderers prop to use RHF
 * for form state management.
 * 
 * @example
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
 * <FormFactory renderers={renderers} />
 * ```
 */
export const RHFFieldRenderer: React.FC<FieldRendererProps> = ({
  name,
  component: Component,
  componentProps = {},
  children,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Component
          {...componentProps}
          {...field}
          name={name}
          value={field.value !== undefined && field.value !== null ? field.value : (componentProps.value || '')}
          onChange={(value: any) => field.onChange(value)}
        >
          {children}
        </Component>
      )}
    />
  );
};
