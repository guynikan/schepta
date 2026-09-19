import React from 'react';

export interface DefaultModalBodyProps {
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultModalBody({
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultModalBodyProps) {
  return (
    <section
      data-slot="body"
      data-schepta-modal-body="true"
      data-test-id={dataTestId}
      style={{
        padding: '20px',
        overflow: 'auto',
        flex: 1,
        minHeight: 0,
        color: 'var(--schepta-text-1)',
        fontSize: '14px',
        lineHeight: 1.5,
      }}
    >
      {xContent ? <p style={{ margin: 0 }}>{xContent}</p> : null}
      {children}
    </section>
  );
}
