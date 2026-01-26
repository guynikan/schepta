import React from 'react';

export const FormField = ({ children, ...props }: any) => {
    return <div data-test-id="FormField" {...props}>{children}</div>;
  };