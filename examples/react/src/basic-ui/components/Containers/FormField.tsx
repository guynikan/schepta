import React from 'react';
import type { FormFieldProps } from '@schepta/factory-react';

export const FormField: React.FC<FormFieldProps> = ({ children, ...props }) => {
    return <div data-test-id="FormField" {...props}>{children}</div>;
  };