import React from 'react';
import { useLayoutContext } from './layout-context';

export interface DefaultLayoutFooterProps {
  ariaLabel?: string;
  sticky?: boolean;
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultLayoutFooter({
  ariaLabel,
  sticky,
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultLayoutFooterProps) {
  const { isPageRoot } = useLayoutContext();

  return (
    <footer
      // Same rule as the header: <footer> nested inside a <div> is not a
      // contentinfo landmark, so the role is only claimed at page root.
      role={isPageRoot ? 'contentinfo' : undefined}
      aria-label={isPageRoot ? ariaLabel || 'Page footer' : ariaLabel}
      data-slot="footer"
      data-test-id={dataTestId}
      style={{
        gridArea: 'footer',
        padding: '12px 16px',
        borderTop: '1px solid var(--schepta-border)',
        background: 'var(--schepta-bg-subtle, transparent)',
        fontSize: '12px',
        color: 'var(--schepta-text-2)',
        position: sticky ? 'sticky' : undefined,
        bottom: sticky ? 0 : undefined,
        zIndex: sticky ? 10 : undefined,
      }}
    >
      {xContent ? <span>{xContent}</span> : null}
      {children}
    </footer>
  );
}
