import React from 'react';
import type { FormSectionGroupContainerProps } from '@schepta/factory-react';

export const FormSectionGroupContainer: React.FC<FormSectionGroupContainerProps> = ({ children, ...props }) => {
    return <div data-test-id="FormSectionGroupContainer" {...props}>{children}</div>;
  };