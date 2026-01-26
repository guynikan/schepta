import React from 'react';

export const FormSectionGroupContainer = ({ children, ...props }: any) => {
    return <div data-test-id="FormSectionGroupContainer" {...props}>{children}</div>;
  };