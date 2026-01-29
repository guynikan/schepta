/**
 * RHF Field Wrapper
 * 
 * Custom FieldWrapper that uses react-hook-form's Controller.
 * This demonstrates how to integrate RHF with Schepta forms.
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldWrapperProps } from '@schepta/factory-react';

/**
 * RHF-based FieldWrapper component.
 * Uses react-hook-form's Controller to bind fields to form state.
 * 
 * Register this component via the components prop to use RHF
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
 *     factory: () => RHFFieldWrapper,
 *   }),
 * };
 * ```
 */
export const RHFFieldWrapper: React.FC<FieldWrapperProps> = ({
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
