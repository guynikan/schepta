import React from 'react';
import type { FormSectionContainerProps } from '@schepta/factory-react';

export const FormSectionContainer: React.FC<FormSectionContainerProps> = ({ children, ...props }) => {
    return <div data-test-id="FormSectionContainer" style={{ marginBottom: '24px' }} {...props}>{children}</div>;
  };