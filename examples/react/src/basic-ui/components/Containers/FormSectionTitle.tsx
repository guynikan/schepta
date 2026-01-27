import React from 'react';
import type { FormSectionTitleProps } from '@schepta/factory-react';

export const FormSectionTitle: React.FC<FormSectionTitleProps> = ({ 'x-content': content, children, ...props }) => {
    return <h2 data-test-id="FormSectionTitle" style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333', ...props.style }} {...props}>{content || children}</h2>;
  };