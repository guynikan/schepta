import React from 'react';

export interface DefaultModalFooterProps {
  align?: 'start' | 'center' | 'end';
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultModalFooter({
  align = 'end',
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultModalFooterProps) {
  const justify =
    align === 'start' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end';

  return (
    <footer
      data-slot="footer"
      data-schepta-modal-footer="true"
      data-test-id={dataTestId}
      style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--schepta-border)',
        background: 'var(--schepta-bg-subtle, transparent)',
        display: 'flex',
        justifyContent: justify,
        gap: '8px',
      }}
    >
      {xContent ? <span>{xContent}</span> : null}
      {children}
    </footer>
  );
}
