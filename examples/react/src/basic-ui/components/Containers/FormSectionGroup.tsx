import React from 'react';
import type { FormSectionGroupProps } from '@schepta/factory-react';

export const FormSectionGroup: React.FC<FormSectionGroupProps> = ({ children, ...props }) => {
    return <div data-test-id="FormSectionGroup" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', ...props.style }} {...props}>{children}</div>;
  };