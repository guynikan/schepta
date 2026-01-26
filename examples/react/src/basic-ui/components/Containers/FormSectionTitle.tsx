import React from 'react';

export const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
    return <h2 data-test-id="FormSectionTitle" style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#333' }} {...props}>{content || children}</h2>;
  };