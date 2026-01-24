import React from 'react';

export const FormSectionGroup = ({ children, columns, ...props }: any) => {
    const gridColumns = columns || 'repeat(auto-fit, minmax(200px, 1fr))';
    return <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '16px' }} {...props}>{children}</div>;
  };