import React from 'react';

export const FormSectionContainer = ({ children, ...props }: any) => {
    return <div data-test-id="FormSectionContainer" style={{ marginBottom: '24px' }} {...props}>{children}</div>;
  };