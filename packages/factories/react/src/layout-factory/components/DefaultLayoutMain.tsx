import React from 'react';
import { MAIN_CONTENT_ID } from './layout-context';

export interface DefaultLayoutMainProps {
  ariaLabel?: string;
  children?: React.ReactNode;
  'x-content'?: string;
  'data-test-id'?: string;
}

export function DefaultLayoutMain({
  ariaLabel,
  children,
  'x-content': xContent,
  'data-test-id': dataTestId,
}: DefaultLayoutMainProps) {
  return (
    <main
      // Target of the container's skip link. Also focusable so that
      // following the link actually moves focus, not just the scroll
      // position — several browsers do not move focus on fragment
      // navigation to a non-focusable element.
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      aria-label={ariaLabel || 'Main content'}
      data-slot="main"
      data-test-id={dataTestId}
      style={{
        gridArea: 'main',
        padding: '24px',
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      {xContent ? <p>{xContent}</p> : null}
      {children}
    </main>
  );
}
