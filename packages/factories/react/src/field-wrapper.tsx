/**
 * Field Wrapper
 * 
 * Wraps field components with react-hook-form Controller
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface FieldWrapperProps {
  name: string;
  component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  children?: React.ReactNode;
}

export function FieldWrapper({ name, component: Component, componentProps = {}, children }: FieldWrapperProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Component
          {...componentProps}
          {...field}
          value={field.value !== undefined && field.value !== null ? field.value : (componentProps.value || '')}
          onChange={(value: any) => field.onChange(value)}
        >
          {children}
        </Component>
      )}
    />
  );
}

