import React from 'react';

export const FormSectionContainer = ({ children, ...props }: any) => {
    return <div style={{ marginBottom: '24px' }} {...props}>{children}</div>;
  };