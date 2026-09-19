import React from 'react';
import { useLayoutContext } from './layout-context';

export interface DefaultLayoutHeaderProps {
  ariaLabel?: string;
  sticky?: boolean;
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultLayoutHeader({
  ariaLabel,
  sticky,
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultLayoutHeaderProps) {
  const { isPageRoot } = useLayoutContext();

  return (
    <header
      // A <header> nested inside a <div> is not a banner landmark per
      // HTML-AAM, so the role is only claimed when this shell owns the page.
      // Naming it is only meaningful once it is a landmark.
      role={isPageRoot ? 'banner' : undefined}
      aria-label={isPageRoot ? ariaLabel || 'Page header' : ariaLabel}
      data-slot="header"
      data-test-id={dataTestId}
      style={{
        gridArea: 'header',
        padding: '12px 16px',
        borderBottom: '1px solid var(--schepta-border)',
        background: 'var(--schepta-bg-subtle, transparent)',
        position: sticky ? 'sticky' : undefined,
        top: sticky ? 0 : undefined,
        zIndex: sticky ? 10 : undefined,
      }}
    >
      {xContent ? <span>{xContent}</span> : null}
      {children}
    </header>
  );
}
