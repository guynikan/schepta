import React from 'react';

export const FormField = ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>;
  };